# High-Level Design (HLD)

Reference: [01-system-architecture.md](01-system-architecture.md)

## 1. Module Responsibility Matrix

| Module | Owns data | Exposes to other modules | Calls out to |
|---|---|---|---|
| auth | `users`, `refresh_tokens`, `otp_codes` | `AuthService.currentUser()`, `TokenService.validate()` | Redis (refresh tokens, OTP), SMS gateway |
| user | `student_profiles`, `parent_profiles`, `tutor_profiles`, `parent_student_links` | `UserProfileService.getTutor()/getStudent()` | S3 (avatars) |
| verification | `tutor_documents` | `VerificationService.status(tutorId)` | S3 (documents) |
| discovery | (reads `tutor_profiles`, `reviews`, no own tables beyond cache) | `SearchService.search(criteria)` | Google Maps Geocoding, Redis (cache) |
| booking | `bookings`, `booking_slots`, `availability_rules` | `BookingService.create/accept/reject/cancel()` | — |
| payment | `payments`, `ledger_entries`, `payouts` | `PaymentService.charge/refund/release()` | Razorpay |
| classroom-online | `class_sessions` | `OnlineClassService.getJoinToken(bookingId)` | Agora |
| classroom-offline | `attendance_records`, `disputes` | `AttendanceService.markAttendance()` | — |
| chat | `chat_threads`, `chat_messages` | `ChatService.send/history()` | FCM (offline delivery) |
| review | `reviews` | `ReviewService.submit()`, feeds discovery's rating sort | — |
| notification | `notifications`, `device_tokens` | `NotificationService.notify(userId, event)` | FCM |
| support | `support_tickets`, `ticket_messages` | `SupportService.*` | — |
| admin | (reads across modules, no new domain tables besides `audit_logs`) | — | — |
| ai (fast-follow) | `ai_conversations`, `ai_messages`, `ai_usage_log` | `AiAssistantService.ask()`, `AiRecommendationService.rank()` | LLM API (Claude) |

Rule enforced at code-review time: a module may only import another module's `*Service` interface, never its `*Repository` or `*Entity`. This is what keeps the "extract to microservice later" option real.

## 2. Key Sequence Flows

### 2.1 Registration + Login (email)

```
Client → POST /api/v1/auth/register {email, password, role}
  Backend: validate → hash password (BCrypt) → create User(status=UNVERIFIED_EMAIL)
         → send verification email (async, does not block response)
  → 201 Created

Client → POST /api/v1/auth/login {email, password}
  Backend: lookup User → verify password → issue access JWT (15m) + refresh token (7d, stored in Redis keyed by userId+deviceId)
  → 200 {accessToken, refreshToken, user}

Client → POST /api/v1/auth/refresh {refreshToken}
  Backend: validate refresh token exists in Redis + not revoked → rotate (delete old, issue new) → new access JWT
  → 200 {accessToken, refreshToken}
```

### 2.2 OTP Login (mobile)

```
Client → POST /api/v1/auth/otp/request {phone}
  Backend: rate-limit check (5/15min) → generate 6-digit OTP → store in Redis (TTL 5min, attempts=0) → send via SMS gateway
  → 200 OK

Client → POST /api/v1/auth/otp/verify {phone, otp}
  Backend: fetch OTP from Redis → compare → on match: find-or-create User → issue JWT + refresh token
           on mismatch: increment attempts, reject after 3
  → 200 {accessToken, refreshToken, user}
```

### 2.3 Tutor Verification

```
Tutor → POST /api/v1/tutors/{id}/documents (multipart or presigned S3 upload + register metadata)
  Backend: store TutorDocument(status=PENDING) → TutorProfile.verificationStatus = SUBMITTED
  → notify Admin queue (async)

Admin → GET /api/v1/admin/verifications?status=SUBMITTED
Admin → POST /api/v1/admin/verifications/{tutorId}/decision {approve|reject, reason}
  Backend: update TutorProfile.verificationStatus = VERIFIED|REJECTED
         → write AuditLog(actor=admin, action=TUTOR_VERIFIED, target=tutorId)
         → NotificationService.notify(tutorId, VERIFICATION_DECIDED)
```

### 2.4 Booking → Payment → Confirmation (the critical path)

```
Student → POST /api/v1/bookings {tutorId, subject, startTime, endTime, mode}
  Backend: check TutorProfile.verificationStatus == VERIFIED (else 403)
         → check no overlapping CONFIRMED booking for this tutor in [startTime,endTime]
           (SELECT ... FOR UPDATE on tutor's booking rows in that window, or exclusion constraint — see LLD)
         → create Booking(status=PENDING_TUTOR_ACTION)
         → NotificationService.notify(tutorId, BOOKING_REQUESTED)
  → 201 {bookingId}

Tutor → POST /api/v1/bookings/{id}/respond {action: ACCEPT}
  Backend: Booking.status = PENDING_PAYMENT, sets payment_deadline = now()+30min
         → PaymentService.createOrder(booking) → Razorpay order id returned to client
  → 200 {razorpayOrderId, amount}

Client → (Razorpay Checkout SDK, client-side) → completes payment
Razorpay → POST /api/v1/webhooks/razorpay {event: payment.captured, orderId, signature}
  Backend: verify webhook signature (HMAC, Razorpay secret)
         → idempotency check (event id already processed?)
         → Payment.status = CAPTURED → Booking.status = CONFIRMED
         → LedgerEntry(type=HOLD, amount, bookingId)   # funds held, not yet payable to tutor
         → NotificationService.notify(both parties, BOOKING_CONFIRMED)

[Background job] every 5 min: find bookings where status=PENDING_PAYMENT and payment_deadline < now()
  → Booking.status = EXPIRED → release tutor's slot
```

### 2.5 Online Class Session

```
Client (either party) → GET /api/v1/bookings/{id}/join-token
  Backend: verify booking.status == CONFIRMED, mode == ONLINE, now() within [start-10min, end+10min]
         → verify caller is a participant of this booking
         → AgoraTokenBuilder.buildToken(channelName=bookingId, uid=userId, role, expiry)
  → 200 {agoraToken, channelName, appId}
  Backend also records ClassSession.actualStart on first join, actualEnd on last leave (Agora webhook or client-reported)
```

### 2.6 Offline Attendance + Dispute

```
Tutor  → POST /api/v1/bookings/{id}/attendance {status: PRESENT}
Student→ POST /api/v1/bookings/{id}/attendance {status: PRESENT}
  Backend: AttendanceRecord written per side
         → when both sides recorded:
             if match (both PRESENT) → Booking.status = COMPLETED → PaymentService.release(bookingId)
             if mismatch            → Booking.status = DISPUTED → Dispute created → Admin notified
  [Background job] 48h after session end with only one side recorded → auto-complete (assume PRESENT) unless a dispute was already raised
```

### 2.7 Chat

```
Client → WebSocket connect /ws (JWT in connect headers, validated by a Spring Security STOMP channel interceptor)
Client → SEND /app/chat/{bookingId} {text}
  Backend: verify caller is a participant → persist ChatMessage → broadcast to /topic/chat/{bookingId}
         → if recipient not connected → NotificationService.notify(recipient, NEW_MESSAGE) via FCM
```

## 3. Non-Functional Design Decisions

- **Booking conflict prevention** is enforced at the DB layer via a PostgreSQL exclusion constraint on (tutor_id, tstzrange(start_time, end_time)) using `btree_gist` — not just application-level locking — so it holds even under concurrent requests from multiple app instances (see Phase 2 DB schema doc).
- **Payment webhook idempotency**: `payments` table has a unique constraint on `razorpay_event_id`; webhook handler does an insert-or-ignore before processing, guaranteeing at-most-once side effects even if Razorpay retries delivery.
- **Search caching**: `discovery` module caches by a cache key of `(geohash-prefix, subject, mode, priceRange)` with 60s TTL in Redis — short enough that newly-verified tutors or updated availability appear quickly, long enough to absorb search traffic spikes.
- **AI module boundary (fast-follow, designed now)**: `AiAssistantService.ask(userId, prompt)` and `AiRecommendationService.rank(studentId, candidates)` are the only two entry points other modules will call. Both go through a shared `AiUsageGuard` (per-user daily quota + cost ceiling) before hitting the LLM API, so cost/abuse control is baked into the interface contract from day one, not bolted on when the fast-follow phase starts.

# Low-Level Design (LLD)

Reference: [02-high-level-design.md](02-high-level-design.md)

## 1. Booking State Machine

```
                 ┌────────────────────┐
                 │  PENDING_TUTOR_ACTION│
                 └──────────┬──────────┘
              tutor rejects │  tutor accepts        no response within 24h
                 ┌──────────┼──────────────────────────────┐
                 ▼          ▼                              ▼
           ┌─────────┐ ┌──────────────────┐          ┌───────────┐
           │REJECTED │ │ PENDING_PAYMENT   │          │  EXPIRED  │
           └─────────┘ └─────┬─────────┬────┘          └───────────┘
                 payment ok  │         │ 30 min elapses, no payment
                 ┌───────────┘         ▼
                 ▼               ┌───────────┐
           ┌───────────┐         │  EXPIRED  │
           │ CONFIRMED │         └───────────┘
           └─────┬─────┘
      session occurs, both mark attendance / online session ends
                 │
        ┌────────┼─────────────────┐
        ▼        ▼                 ▼
  ┌───────────┐ ┌──────────┐  ┌─────────────┐
  │ COMPLETED │ │ DISPUTED │  │  CANCELLED   │ ◀── either party cancels before session (policy-driven refund %)
  └───────────┘ └────┬─────┘  └─────────────┘
                      │ admin resolves
                      ▼
                ┌───────────┐
                │ COMPLETED │ or │ CANCELLED (fault-based) │
                └───────────┘
```

**Enum**: `BookingStatus { PENDING_TUTOR_ACTION, REJECTED, PENDING_PAYMENT, EXPIRED, CONFIRMED, COMPLETED, DISPUTED, CANCELLED }`

Transitions are enforced by a single `BookingStateMachine` component (not scattered `if` checks across controllers) — every transition method takes `(Booking, TargetStatus, actor)` and throws `IllegalBookingTransitionException` if the edge isn't in the allowed transition table. This is the standard State pattern, kept intentionally simple (a map of allowed edges) rather than a full state-machine framework, since the graph is small and static.

```java
public enum BookingStatus {
    PENDING_TUTOR_ACTION, REJECTED, PENDING_PAYMENT, EXPIRED,
    CONFIRMED, COMPLETED, DISPUTED, CANCELLED
}

@Component
public class BookingStateMachine {

    private static final Map<BookingStatus, Set<BookingStatus>> ALLOWED = Map.of(
        PENDING_TUTOR_ACTION, Set.of(REJECTED, PENDING_PAYMENT, EXPIRED),
        PENDING_PAYMENT,      Set.of(CONFIRMED, EXPIRED),
        CONFIRMED,            Set.of(COMPLETED, DISPUTED, CANCELLED),
        DISPUTED,             Set.of(COMPLETED, CANCELLED)
    );

    public void transition(Booking booking, BookingStatus target, String actorUserId) {
        Set<BookingStatus> allowed = ALLOWED.getOrDefault(booking.getStatus(), Set.of());
        if (!allowed.contains(target)) {
            throw new IllegalBookingTransitionException(booking.getId(), booking.getStatus(), target);
        }
        booking.setStatus(target);
        booking.setLastTransitionAt(Instant.now());
        auditLogService.record(actorUserId, "BOOKING_STATUS_CHANGE",
            booking.getId().toString(), Map.of("to", target.name()));
    }
}
```

### Concurrency: preventing double-booking

Two layers, not one:

1. **DB-level** (source of truth): PostgreSQL exclusion constraint using `btree_gist`:
   ```sql
   ALTER TABLE bookings
     ADD CONSTRAINT no_overlapping_confirmed_bookings
     EXCLUDE USING gist (
       tutor_id WITH =,
       tstzrange(start_time, end_time) WITH &&
     ) WHERE (status = 'CONFIRMED');
   ```
   This makes double-booking impossible even with two app instances racing — the DB rejects the second insert/update outright.
2. **Application-level** (fast failure, good UX): before attempting the insert, the service does a read check and returns a friendly 409 `SLOT_NO_LONGER_AVAILABLE` rather than surfacing a raw constraint-violation stack trace. The DB constraint is the safety net; the app check is the UX layer.

## 2. Payment / Ledger State Machine

```
Payment: CREATED → AUTHORIZED → CAPTURED → (RELEASED | REFUNDED | FAILED)

LedgerEntry types: HOLD (on capture) → RELEASE (on session completion, credits tutor payable balance)
                                      → REFUND (on cancellation, debits hold, money returns to payer)
```

- `Payment` and `LedgerEntry` are separate tables: `Payment` mirrors Razorpay's view (one row per payment attempt); `LedgerEntry` is the platform's internal double-entry-ish record of *who owes/is owed what*, independent of any single payment attempt (needed for refund partials, disputes, commission calc).
- Commission is calculated at RELEASE time: `payable = amount * (1 - platform_commission_rate)`. Rate is a config value (Phase 1 leaves it configurable per-tutor-tier for later; MVP uses one flat rate).
- Payout batch (MVP, manual): Admin triggers `POST /api/v1/admin/payouts/run` → sums each tutor's un-paid `RELEASE` ledger entries → creates a `Payout` record with status `PENDING` → admin marks `PAID` after manual bank transfer, referencing the transfer UTR number for audit.

## 3. Auth Token Lifecycle

- **Access token (JWT)**: HS256 (or RS256 if we anticipate multiple verifying services later — RS256 chosen for headroom), 15 min expiry, claims: `sub` (userId), `role`, `iat`, `exp`, `jti`.
- **Refresh token**: opaque random 256-bit token (not a JWT — no need for it to be self-describing), stored in Redis as `refresh:{userId}:{deviceId} → {tokenHash, expiresAt}`. Only the hash is stored (SHA-256), so a Redis compromise doesn't leak usable tokens directly.
- **Rotation**: every refresh call invalidates the old token and issues a new one (`jti` chain not required since Redis is authoritative — old key is simply deleted). This detects token replay: if a stolen-and-already-used refresh token is replayed, the lookup fails (key gone) and the endpoint responds 401, and optionally we revoke all sessions for that user as a precaution (configurable).
- **Logout**: deletes the specific `refresh:{userId}:{deviceId}` key. **Logout-all**: deletes all keys matching `refresh:{userId}:*` (SCAN, not KEYS, in production).

```java
public interface TokenService {
    AccessToken issueAccessToken(User user);
    RefreshToken issueRefreshToken(User user, String deviceId);
    RefreshToken rotate(String presentedRefreshToken, String deviceId); // throws InvalidTokenException
    void revoke(String userId, String deviceId);
    void revokeAll(String userId);
}
```

## 4. Rate Limiting (Redis fixed-window counter)

**Implemented as** (Phase 4): a Spring AOP `@Around` aspect on a `@RateLimited(bucket, capacity, refillMinutes)`
annotation, using plain `INCR` + `EXPIRE` on first hit against a Redis key
`ratelimit:{bucket}:{clientIp}` — not Bucket4j. A fixed-window counter is simpler to reason
about than a token bucket and sufficient for the abuse patterns being guarded against here
(credential stuffing, OTP brute-force); Bucket4j's smoother rate-limiting curve wasn't worth
the extra dependency and Redis-backed `ProxyManager` wiring for this scale.

Keyed by client IP only for now — SRS FR-1.6 calls for "+identifier" (email/phone) too,
which would require reading the request body before controller binding (a caching
body-reading filter). Deferred until a concrete abuse case justifies that complexity;
IP-based limiting alone already stops the common case (single attacker IP hammering one
endpoint).

Applied selectively via `@RateLimited(bucket = "otp-request", capacity = 5, refillMinutes = 15)`
on controller methods — not global — so normal read endpoints aren't penalized. See
`backend/src/main/java/com/hometuitions/backend/common/ratelimit/`.

## 5. Verification Workflow — Class Sketch

```java
public interface VerificationService {
    TutorDocument submitDocument(UUID tutorId, DocumentType type, String s3Key);
    void decide(UUID tutorId, UUID adminId, VerificationDecision decision, String reason);
    VerificationStatus statusOf(UUID tutorId);
}

public enum VerificationStatus { NOT_SUBMITTED, SUBMITTED, VERIFIED, REJECTED }
```
`decide()` is the only path that flips `TutorProfile.verificationStatus`; it's `@Transactional`, writes an `AuditLog` row in the same transaction (so a decision is never recorded without its audit trail — no eventual-consistency gap here since both are the same DB).

## 6. Dispute Resolution — Class Sketch

```java
public interface DisputeService {
    Dispute create(UUID bookingId, DisputeReason reason);
    void resolve(UUID disputeId, UUID adminId, DisputeResolution resolution); // COMPLETE_AND_PAY | CANCEL_AND_REFUND
}
```
`resolve()` delegates back into `BookingStateMachine.transition()` and `PaymentService` — the admin module does not touch `payments`/`ledger_entries` tables directly, it only orchestrates calls to `booking` and `payment` services, honoring the module-boundary rule from the HLD.

## 7. AI Module — Interface Sketch (designed now, wired in fast-follow)

```java
public interface AiAssistantService {
    AiAnswer ask(UUID studentId, String question, UUID conversationId /* nullable = new thread */);
}

public interface AiRecommendationService {
    List<TutorRecommendation> recommend(UUID studentId, RecommendationContext ctx);
}

@Component
public class AiUsageGuard {
    // checks ai_usage_log for (userId, date) sum(tokensUsed) < dailyQuota
    // throws AiQuotaExceededException -> mapped to 429 at the controller layer
    public void checkAndRecord(UUID userId, int estimatedTokens) { ... }
}
```
Both service implementations call an internal `LlmClient` adapter (wraps the Claude API call), so swapping providers or adding a fallback model later touches one class, not every call site.

# Phase 10 — Chat (+ Notifications)

WebSocket messaging scoped to a booking, plus a basic notification module. Notifications
were folded into this phase rather than deferred again — several earlier phases (4, 5, 8,
9) explicitly flagged "NotificationService doesn't exist yet" as a known gap with a promise
that it lands in Phase 10; this phase makes good on that instead of pushing it out again.

## What was built

### Backend — Chat

- **`ChatThread`/`ChatMessage` entities**, matching the Phase 2 schema. Threads are created
  lazily on first message (not eagerly at booking creation) — exactly as flagged back in
  Phase 8's docs, since most bookings never reach a point where anyone chats.
- **`ChatService`**: centralizes the participant-authorization check (reusing
  `BookingService.isParticipant`, introduced in Phase 9) so both the REST history endpoint
  and the WebSocket handler enforce the identical rule — only the booking's student, parent,
  or tutor may read/send.
- **WebSocket wiring**: `StompAuthChannelInterceptor` validates the JWT on the STOMP CONNECT
  frame (the JWT travels inside the STOMP frame, not as an HTTP header — the SockJS
  handshake itself is public at the HTTP layer for that reason, permitted in `SecurityConfig`).
  Extracted the JWT-parsing logic that used to live only in `JwtAuthFilter` into a shared
  `JwtService`, so the HTTP and WebSocket auth paths can't quietly drift apart on how a
  token is validated. `ChatWebSocketController` handles `/app/chat/{bookingId}` sends and
  broadcasts to `/topic/chat/{bookingId}`.
- **`GET /api/v1/bookings/{bookingId}/chat/messages`** for history on load, before the live
  subscription takes over.

### Backend — Notifications

- **`Notification`/`DeviceToken` entities**, matching Phase 2's schema (the `device_tokens`
  table had existed unused since the very first migration).
- **`PushGateway`** interface + `ConsolePushGateway` dev stub — same shape as `SmsGateway`/
  `ConsoleSmsGateway` from Phase 4, so swapping in real Firebase Admin SDK later touches one
  class. A push failure is always best-effort and never fails the caller's transaction
  (logged and swallowed) — a dead FCM token must not block someone from accepting a booking.
- **`NotificationService`**: persist + best-effort push, list-for-user, mark-read (with an
  ownership check — a notification belongs to exactly the user it was sent to),
  device-token registration.
- **Closed out several previously-flagged gaps in one pass**: `BookingNotificationEventListener`
  and `ChatNotificationEventListener` subscribe to the same domain events already used for
  payment orchestration (`BookingRequestedEvent`, `BookingAcceptedEvent`,
  `BookingRejectedEvent`, `BookingCancelledEvent`, `ChatMessageSentEvent` — the first and
  last are new this phase) and turn each into an in-app + push notification for whichever
  party didn't cause it. This is the same event-based decoupling pattern from Phase 9
  (avoids a circular dependency between `booking`/`chat` and `notification`), applied
  consistently rather than reinvented.

### Website

- `ChatPanel`: connects via `@stomp/stompjs` + `sockjs-client`, fetches history on mount,
  subscribes for live messages, sends via STOMP publish. One client per open panel, torn
  down on unmount so a user with several booking cards expanded doesn't accumulate sockets.
- Added a `getCurrentUserId()` helper (decodes the JWT's `sub` claim client-side) so the
  chat bubble styling can tell "mine" from "theirs" without an extra `/me` round trip — the
  token is already in memory and its payload isn't encrypted, just base64.
- Chat toggle added to `BookingList` (student/parent) and the tutor's bookings page.

## Known gaps

- **No read receipts / typing indicators** — out of scope for a first pass; the SRS doesn't
  call for them and they'd add real complexity (presence tracking) for uncertain value this
  early.
- **No push notification is sent for chat messages while the recipient is actively viewing
  the same chat panel** — the in-app row is still created regardless, this is purely about
  redundant push noise; deferred rather than solved with presence-tracking machinery that
  doesn't exist yet.
- **FCM is a console stub** (matches SMS's OTP stub from Phase 4) — real Firebase Admin SDK
  wiring is an ops/credentials task, not core logic, deferred the same way.
- **No route guards** (recurring gap, Phases 5-9) — still applies to chat/notification UI.
- **Notification list has no pagination** — fine at current expected volume, worth
  revisiting if a user accumulates hundreds of notifications.

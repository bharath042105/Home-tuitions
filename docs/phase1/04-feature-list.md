# Feature List

Status legend: **MVP** (building now) · **Fast-follow** (designed for, built right after MVP) · **Deferred** (not designed yet, see [00-mvp-scope.md](00-mvp-scope.md))

| Feature | Status | Notes |
|---|---|---|
| Email/password auth | MVP | |
| OTP auth (mobile) | MVP | |
| JWT + refresh token rotation | MVP | |
| Google/Apple login | Fast-follow | Auth module built with OAuth-pluggable design (Spring Security supports adding providers without rework) |
| Role-based authorization | MVP | Student, Parent, Tutor, Admin |
| Profile management (all roles) | MVP | |
| Tutor verification workflow | MVP | Document upload (S3), admin approve/reject |
| Nearby tutor search (geolocation) | MVP | Google Maps Geocoding + PostGIS/Haversine query |
| Advanced filters (subject/price/rating/mode/availability) | MVP | |
| Booking system (request/accept/reject/reschedule) | MVP | |
| Booking conflict prevention | MVP | DB constraint + lock |
| Cancellation & refund policy | MVP | |
| Online classes (Agora) | MVP | 1:1 only at launch; group rooms fast-follow |
| Offline home tuition (dual attendance confirmation) | MVP | GPS proof-of-presence is fast-follow |
| Attendance tracking | MVP | Tied to booking, both modes |
| Homework | Fast-follow | Prerequisite for AI Homework Solver |
| Assignments | Fast-follow | Grouped with Homework module |
| Exams | Fast-follow | Prerequisite for AI Test Generator (question banks/quizzes) |
| Progress reports | Fast-follow | Depends on attendance + review data already captured in MVP |
| Parent dashboard | MVP | View child's bookings, payments, attendance |
| Tutor dashboard | MVP | Schedule, earnings, requests |
| Admin dashboard | MVP | Verification, users, bookings, basic analytics, tickets |
| Chat (1:1, per booking) | MVP | WebSocket + persisted history |
| Notifications (push + in-app) | MVP | FCM |
| Payments (Razorpay) | MVP | Order, capture, refund, webhook handling |
| Wallet | Deferred | |
| Coupons | Deferred | |
| Reviews & ratings | MVP | |
| Support tickets | MVP | |
| Referral program | Deferred | |
| Blogs / CMS | Deferred | |
| Analytics (advanced/BI) | Deferred | Basic counts only in MVP admin dashboard |
| AI Study Assistant | Fast-follow | LLM-backed chat Q&A; needs AI Service module (designed in Phase 2, wired in fast-follow) |
| AI Tutor Recommendation | Fast-follow | MVP search ranking is rule-based (distance/rating/price); replaced once enough booking/review data exists |
| AI Homework Solver | Fast-follow | Depends on Homework module (also fast-follow) |
| AI Test Generator | Fast-follow | Depends on Exams module (also fast-follow) |
| Flutter mobile app | Fast-follow | Built once web + API are stable, same backend |
| Dark mode | MVP | Material 3 / Tailwind theme tokens from day one (cheap to include early, expensive to retrofit) |
| Audit logs (backend) | MVP | Logged from day one for compliance; admin UI for browsing logs is fast-follow |

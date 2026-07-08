# Information Architecture — MVP

## 1. Site/App Map by Role

### Public (unauthenticated)
- Home / landing
- Tutor search & discovery (browse-only, booking requires login)
- Tutor public profile page
- Login / Register (email or OTP)
- About, Contact, Support (static)

### Student
- Dashboard (upcoming sessions, notifications)
- Search tutors → filters → results → tutor profile → request booking
- My Bookings (Pending / Confirmed / Completed / Cancelled / Disputed tabs)
- Booking detail → Chat, Join class (online) / Attendance (offline), Payment status
- My Reviews (given)
- Profile & Settings
- Support Tickets

### Parent
- Dashboard (per-child overview)
- Manage Student sub-profiles (add/edit child)
- Search tutors (on behalf of child) → same flow as Student
- My Bookings (aggregated across children)
- Payments & Invoices
- Profile & Settings
- Support Tickets

### Tutor
- Dashboard (today's sessions, pending requests, earnings snapshot)
- Profile & Verification (edit profile, view verification status, resubmit documents)
- Availability calendar management
- Booking Requests (incoming — accept/reject/propose)
- My Sessions (upcoming/past, mode-tagged online/offline)
- Session detail → Chat, Start class (online) / Mark attendance (offline)
- Earnings & Payouts
- Reviews (received)
- Support Tickets

### Admin
- Dashboard (KPIs: users, tutors, bookings, revenue — Chart.js)
- Tutor Verification Queue → document viewer → approve/reject
- User Management (search/filter/suspend/reinstate)
- Booking Oversight (all bookings, dispute resolution)
- Support Ticket Queue
- (Fast-follow) Audit Log Viewer, CMS/Blog editor

## 2. Navigation Model

- **Website (Next.js)**: role-aware top nav collapses to relevant items post-login; public marketing pages fully SSR for SEO (tutor discovery pages are the primary organic-traffic surface, similar to UrbanPro's SEO play).
- **Admin Dashboard (separate Next.js app)**: left sidebar nav, standard admin shell (MUI), not SEO-relevant, CSR is fine.
- **Mobile (Flutter, fast-follow)**: bottom nav bar per role (Home, Search, Bookings, Chat, Profile), Go Router for declarative role-based routing/guards.

## 3. Core Entity Relationships (preview — full ER in Phase 2)

```
User (1) ──< Role-specific profile (Student/Parent/Tutor)
Parent (1) ──< Student (0..n)              [linked minors]
Tutor (1) ──< TutorDocument (1..n)         [verification]
Tutor (1) ──< Availability (0..n)
Student/Parent (1) ──< Booking (0..n) >── (1) Tutor
Booking (1) ── (0..1) Payment
Booking (1) ── (0..1) ChatThread ──< Message
Booking (1) ── (0..1) Review
Booking (1) ── (0..2) AttendanceRecord     [one per side for offline]
User (1) ──< Notification (0..n)
User (1) ──< SupportTicket (0..n)
```

## 4. Content/Data Classification (drives access control design)

| Data | Sensitivity | Access |
|---|---|---|
| Tutor verification documents | High (PII) | Tutor (own), Admin only |
| Chat messages | Medium | Both booking participants, Admin (dispute only) |
| Payment records | High | Owner (student/parent/tutor involved), Admin |
| Reviews | Public | Anyone (published), author can edit within window |
| Profile basic info (name, subjects, rate) | Public | Anyone |
| Address/exact location | Medium | Revealed only after booking confirmed (not in public search results — shows approximate distance only) |

# System Architecture

Reference: [Phase 1 — MVP scope](../phase1/00-mvp-scope.md)

## 1. Architecture Style

**Modular monolith** on the backend (single Spring Boot deployable, package-by-module with strict boundaries), not microservices — at this stage, microservices would add operational overhead (service discovery, distributed tracing, network failure modes) without a corresponding scale need. Module boundaries are drawn so that splitting any module into its own service later is a mechanical extraction, not a rewrite:

- `auth` — registration, login, JWT/refresh, OTP, OAuth (fast-follow)
- `user` — profiles for Student/Parent/Tutor, Admin user management
- `verification` — tutor document upload/review workflow
- `discovery` — search, filters, geolocation ranking
- `booking` — booking lifecycle, availability, conflict prevention
- `payment` — Razorpay integration, ledger, payouts
- `classroom-online` — Agora session orchestration
- `classroom-offline` — attendance, dispute creation
- `chat` — WebSocket messaging
- `review` — ratings/reviews
- `notification` — push/in-app dispatch
- `support` — tickets
- `admin` — cross-module oversight, analytics aggregation
- `ai` — isolated module, no dependents in MVP; exposes a clean interface (`AiAssistantService`, `AiRecommendationService`) that other modules call once wired in fast-follow. Talks to an external LLM API, never touches the DB directly outside its own tables (usage logs, conversation history).

Each module: own package, own DTOs, communicates with other modules only via public service interfaces (no reaching into another module's repository/entity directly). This is what makes the "split into microservices later if needed" claim real.

## 2. High-Level Component Diagram

```
                                   ┌─────────────────────┐
                                   │   Google Maps API    │
                                   └──────────▲───────────┘
                                              │
┌────────────┐   HTTPS/REST   ┌───────────────┴────────────────┐   ┌──────────────┐
│  Next.js    │───────────────▶│                                │──▶│   Razorpay   │
│  Website    │◀───────────────│                                │◀──│  (Orders/    │
└────────────┘   WebSocket     │      Spring Boot 3 Backend      │   │  Webhooks)   │
                  (chat)       │      (Modular Monolith)         │   └──────────────┘
┌────────────┐                 │                                │
│  Next.js    │───────────────▶│  Nginx reverse proxy in front  │──▶┌──────────────┐
│  Admin      │◀───────────────│                                │   │  Agora SDK   │
└────────────┘                 └──────┬─────────────┬───────────┘   │ (token issue)│
                                       │             │               └──────────────┘
┌────────────┐   HTTPS/REST           │             │
│  Flutter    │───────────────▶       │             │              ┌──────────────┐
│  Mobile     │◀───────────────       │             │──────────────▶│     FCM      │
│ (fast-follow)│  WebSocket           │             │               └──────────────┘
└────────────┘                 ┌──────▼──────┐  ┌───▼────────┐
                                │ PostgreSQL   │  │   Redis     │
                                │ (Flyway      │  │ (sessions/  │
                                │  migrated)   │  │  refresh    │
                                │              │  │  tokens/    │
                                │              │  │  rate-limit,│
                                │              │  │  cache)     │
                                └──────────────┘  └─────────────┘
                                       │
                                ┌──────▼──────┐
                                │   AWS S3     │
                                │ (documents,  │
                                │  avatars)    │
                                └──────────────┘
```

## 3. Request Flow (typical read)

Client → Nginx (TLS termination, gzip, static asset cache) → Spring Boot (Spring Security filter chain: JWT validate → rate limiter check → controller → service → repository) → PostgreSQL, with Redis read-through cache for hot reads (tutor search results, profile views).

## 4. Deployment View (AWS, single region for MVP)

- **Compute**: Backend runs as a Docker container on ECS Fargate (or EC2 + Docker Compose for a leaner initial budget — see Phase 16 for the tradeoff); Nginx as a sidecar/ALB in front.
- **Website + Admin**: Next.js apps deployed as separate services (Vercel, or containerized behind the same ALB) — SSR requires a Node runtime, not static export, because tutor discovery pages need to be dynamically rendered/SEO-fresh.
- **Database**: RDS PostgreSQL (Multi-AZ deferred until post-MVP budget allows; single-AZ + automated backups for MVP).
- **Cache**: ElastiCache Redis (single node for MVP).
- **Storage**: S3 bucket per environment (`hometuitions-{env}-documents`, `-avatars`), SSE-KMS encryption, presigned URLs for upload/download — backend never proxies file bytes.
- **CI/CD**: GitHub Actions → build + test → Docker image → push to ECR → deploy to ECS (Phase 16 detail).
- **Secrets**: AWS Secrets Manager, injected as env vars at container start — never committed to the repo.

## 5. Cross-Cutting Concerns

- **Idempotency**: Payment webhook handlers and booking-confirmation endpoints are idempotent (dedupe key = Razorpay event id / booking id + action), since webhooks can be retried by the provider.
- **Observability**: every request gets a correlation ID (MDC in Spring, propagated to logs); structured JSON logging; `/actuator/prometheus` exposed internally only.
- **Rate limiting**: Redis-backed token bucket per IP+user for auth and payment-sensitive endpoints (Bucket4j + Redis).
- **Caching strategy**: tutor search results cached briefly (60s) keyed by (geohash, filters) — short TTL because availability changes; profile reads cached 5 min with explicit invalidation on profile update.
- **AI module isolation**: the `ai` module is the only module allowed to make outbound calls to a third-party LLM API; it owns its own cost/usage tracking table so a runaway prompt loop is contained and measurable, not a mystery AWS bill traced back after the fact.

## 6. Why modular monolith over microservices (explicit tradeoff)

| Concern | Modular monolith (chosen) | Microservices |
|---|---|---|
| Team size (solo/small) | One deployable, one CI pipeline, fast iteration | Overhead: N pipelines, N repos or a monorepo tooling problem, service mesh |
| Data consistency (booking + payment + ledger) | Single DB transaction across modules | Distributed transaction / saga complexity for what is fundamentally one write |
| Scaling needs at MVP | Low — vertical/horizontal scale of one service is enough | Not justified yet |
| Future flexibility | Module boundaries make extraction possible later (e.g., pull `ai` out first, since it's already isolated and stateless-ish) | N/A — already there, but paid for upfront |

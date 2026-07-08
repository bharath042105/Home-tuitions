# Phase 3 — Project Structures

Three codebases were scaffolded at the repo root, alongside `docs/`:

```
Home Tuitions/
├── docs/            Phase 1 & 2 deliverables (product, architecture, DB)
├── backend/         Spring Boot 3 modular monolith (Java 21, Maven)
├── web/             pnpm + Turborepo workspace: apps/website, apps/admin, packages/shared
└── mobile/          Flutter app (feature-first), scaffolded now, implemented after web MVP
```

## Backend (`backend/`)

Package-by-module under `com.hometuitions.backend`, one package per Phase 2 module
(`auth`, `user`, `verification`, `discovery`, `booking`, `payment`, `classroom`, `chat`,
`review`, `notification`, `support`, `admin`, `ai`), each internally layered
(`controller` / `service`+`impl` / `repository` / `dto` / `entity` / `mapper`), plus a
`common` package for cross-cutting concerns (security, config, exceptions, audit).

**Hard rule enforced at code-review time**: a module may only depend on another module's
`*Service` interface — never its repository or entity classes directly. This is what
would make extracting any module (e.g. `ai`, already isolated) into its own service later
a mechanical move instead of a rewrite.

`auth` is the one module fleshed out with real code, as the concrete pattern to follow:
`User` entity, `UserRepository`, `TokenService`/`TokenServiceImpl` (JWT access token +
Redis-backed opaque refresh token with rotation, matching
`docs/phase2/03-low-level-design.md`  3), `AuthService`/`AuthServiceImpl`, and
`AuthController`. Every other module currently has only a `package-info.java`
documenting its responsibility (pulled from the HLD's Module Responsibility Matrix) —
real logic lands starting Phase 4.

The 7 Flyway migrations from `docs/phase2/05-database-schema.md` were copied verbatim into
`src/main/resources/db/migration/`. `spring.jpa.hibernate.ddl-auto=validate` — Flyway is the
only source of schema truth.

`pom.xml` includes every dependency the spec calls for (Security, Data JPA, WebSocket,
Flyway, PostgreSQL driver, Redis, JJWT, springdoc-openapi, Lombok, MapStruct, Bucket4j,
AWS S3 SDK, Testcontainers). A `docker-compose.yml` brings up Postgres (with PostGIS) +
Redis for local dev.

**Known gap**: the Maven wrapper (`mvnw`) isn't generated in this scaffold — no local Maven
install was available in this environment to run `mvn -N io.takari:maven:wrapper`. Documented
in `backend/README.md`; run that one command locally before first build, or substitute `mvn`.

## Web (`web/`)

pnpm workspace + Turborepo, three packages:

- **`apps/website`** — Next.js 15 App Router, TypeScript, Tailwind, React Query, React Hook
  Form + Zod. Route groups `(public)`, `(student)`, `(parent)`, `(tutor)` mirror the IA from
  `docs/phase1/05-information-architecture.md`. Concrete example pages built: home page and
  a login page wired end-to-end (shared zod schema → RHF resolver → React Query mutation →
  shared API client). Other route groups have a README describing intended contents and
  which build phase populates them.
- **`apps/admin`** — Next.js 15, MUI (data-dense components) + Tailwind (layout, with
  `preflight: false` so it doesn't fight MUI's baseline), TanStack Table, Chart.js. Concrete
  example built: the tutor verification queue page (`/verifications`), matching US-ADM-01.
- **`packages/shared`** — TypeScript types mirroring backend DTOs, zod schemas (single
  source of truth for both apps' form validation), and a fetch-based typed API client
  (JWT attach + 401 handling hook) consumed by both apps identically.

**Why one workspace, two apps** (not one app with role-based routing, not two separate
repos): website and admin have different audiences and rendering needs (website needs
SSR for SEO on tutor discovery pages; admin is pure CSR, no SEO need), but both consume
the same backend contracts — worth sharing via `packages/shared` rather than duplicating
types/schemas twice or paying multi-repo overhead for a solo/small team.

## Mobile (`mobile/`)

Flutter, feature-first: `lib/core/` (network via Dio + JWT interceptor, routing via
go_router with role-based redirect guards, Material 3 theme light/dark, error handling)
and `lib/features/<name>/` split into `data/` / `domain/` / `presentation/` — clean-
architecture-lite, kept pragmatic (no forced use-case classes for trivial CRUD).

`auth` is the fleshed-out feature: `User` (Freezed) + `AuthRepository` interface +
`AuthRepositoryImpl` (Dio) + Riverpod providers + a working `LoginScreen` (Flutter Hooks
for local form state). Other features (`tutor_search`, `booking`, `chat`, `profile`) have
folders + a README noting which phase builds them.

`pubspec.yaml` includes every dependency specified (Riverpod + codegen, go_router, Dio,
Freezed, Flutter Hooks, Material 3, plus `firebase_messaging` and `agora_rtc_engine` added
now even though mobile implementation starts after the web MVP, per
`docs/phase1/00-mvp-scope.md` sequencing — the scaffold needs to exist so no later
pubspec rework is required).

**Known gap**: no Flutter SDK was available in this environment, so `flutter create`/
`pub get`/codegen were not run — `*.freezed.dart` and `*.g.dart` files referenced by
`part` directives don't exist yet. Documented in `mobile/README.md` with the exact
commands to run once the SDK is available locally.

## What's NOT in Phase 3

No business logic beyond the `auth` reference implementation in each codebase, no CI/CD
(Phase 16), no actual AWS/DB provisioning. Phase 4 (Authentication) is next, and now has a
concrete skeleton to build the real behavior into rather than starting from an empty repo.

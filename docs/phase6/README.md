# Phase 6 — Student Module

Student profile management and tutor discovery (nearby search + filters). Mobile stays
deferred per the standing MVP sequencing decision.

## What was built

### Backend

- **Schema fix carried over from Phase 5's gap-hunting**: `tutor_profiles` had no name
  field at all (missed in the original Phase 2 design). Fixed via an additive `V8`
  migration (`display_name`) rather than editing the already-"shipped" `V2` — same
  discipline applied again this phase.
- **`user` module**: `StudentProfile` entity/repo/service/`StudentController`
  (`GET/PUT /api/v1/students/me`), restricted to the `STUDENT` role.
- **Geo search infrastructure**: `TutorProfile.baseLocation` (PostGIS `geography`) is
  deliberately *not* JPA-mapped (avoids pulling in hibernate-spatial for one column) — instead:
  - `TutorProfileRepository.updateLocation()` — a native `UPDATE ... ST_MakePoint(...)`,
    wired into `TutorProfileServiceImpl.createOrUpdate()` whenever a tutor submits lat/lng.
  - `TutorProfileRepository.searchNearby()` — a native `ST_DWithin` query (using the
    `base_location` GIST index from Phase 2's schema, so this is an index scan not a table
    scan) with optional filters (`subject`, `mode`, price range, min rating), returning a
    `TutorSearchProjection` (subjects come back `array_to_string`-joined rather than as a
    Postgres array, sidestepping a JDBC array-mapping headache for a field that's only ever
    displayed). **Only `VERIFIED` tutors are ever returned** — enforced in the query itself
    (SRS FR-3), not left to the caller to filter.
  - Both native queries live on `TutorProfileRepository`, but are only ever called *through*
    `TutorProfileService` — added `searchNearby(...)` to that service interface specifically
    so the `discovery` module never touches `user`'s repository directly, preserving the
    module-boundary rule from Phase 2's HLD.
- **`discovery` module**: `SearchService`/`Impl` + `DiscoveryController`
  (`GET /api/v1/tutors/search`, public). Caches results in Redis for 60s
  (`docs/phase2/02-high-level-design.md`  3's "short TTL because availability changes"),
  keyed by a coarse ~1.1km lat/lng bucket + the filter set — implemented as manual
  read/write against `StringRedisTemplate` (JSON via the app's `ObjectMapper`) rather than
  `@Cacheable`, since the cacheable page result (Spring Data `Page`) doesn't serialize
  cleanly through Jackson and self-invocation would have complicated an annotation-based
  approach anyway; a plain `CachedSearchPage` record round-trips cleanly instead.

### Website

- **Repeated the Phase 5 route-group fix**: `(student)` was still a parenthesized route
  group (no URL prefix) from the Phase 3 scaffold. Replaced with a real `student/` folder,
  same as `tutor/` in Phase 5. `(parent)` still has the same latent issue — flagged again
  in its README for Phase 7.
- `StudentShell` (top bar nav: Find a tutor / Profile) as the layout for `/student/*`.
- `/student/profile` — edit name/grade/subjects of interest/city.
- `/student/search` — "Use my location" (browser Geolocation API) gate, then a filters form
  (subject/mode/price range/min rating/radius) and a results list of tutor cards
  (name, subjects, rate, distance, rating, mode badge), each linking to the detail page.
- `/student/tutors/[id]` — public tutor profile detail page. The "Request booking" button
  is present but disabled with an explanatory note — booking doesn't exist until Phase 8,
  and a half-wired booking button that silently does nothing would be worse than an
  honestly-disabled one.

## Known gaps

- **No route guards** (same gap noted in Phase 5) — `/student/*` assumes the caller is an
  authenticated student; no redirect-if-wrong-role behavior on the website yet.
- **`(parent)` still has the route-group URL-prefix issue** — deferred to Phase 7 rather
  than fixed preemptively, to keep this phase's diff scoped to what it actually touched.
- **Search radius/filter inputs have no debounce** — every "Apply filters" click is a fresh
  query; fine at this scale, revisit if search becomes a hot path before Phase 16 load testing.
- **No Google Maps Places Autocomplete** — search location comes from the browser's
  Geolocation API only (no manual address search yet). Deferred since it needs a Google
  Maps Platform API key/billing setup, which is an ops/config task, not core logic; the
  search backend already accepts arbitrary lat/lng, so wiring in Places Autocomplete later
  is additive, not a rework.
- **Mobile student screens**: not started, per the standing MVP sequencing decision.

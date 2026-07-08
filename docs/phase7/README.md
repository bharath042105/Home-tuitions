# Phase 7 — Parent Module

Parent profile management, child sub-profiles, and "search on behalf of child." Mobile
stays deferred per the standing MVP sequencing decision.

## What was built

### Backend

- **Another schema gap found and fixed, same pattern as Phases 5-6**: `student_profiles.user_id`
  was `NOT NULL` (Phase 2), which is fine for self-registered students but breaks for
  parent-added child sub-profiles that have no login of their own (US-STU-02). Creating a
  credential-less `User` row per child isn't possible either — `users.chk_email_or_phone`
  requires an email or phone. Fixed via additive `V9` migration (`user_id` now nullable);
  `UNIQUE(user_id)` already tolerates multiple `NULL`s in Postgres, so nothing else needed
  changing. `StudentProfile.userId` in the entity updated to match.
- **`StudentProfileService`** grew `getById`, `getByIds` (batch), `createManagedByParent`,
  and `updateManagedProfile` — all still living in the `user` module alongside the existing
  `StudentProfile` entity/repository, so no cross-module boundary is crossed by adding them.
- **New `ParentProfile` and `ParentStudentLink` entities**, `ParentProfileService`/`Impl`,
  and `ParentController`:
  - `GET/PUT /api/v1/parents/me` — own profile.
  - `GET/POST /api/v1/parents/me/children` — list / add a child sub-profile.
  - `PUT /api/v1/parents/me/children/{id}` — update a child, but only after verifying a
    `ParentStudentLink` actually exists between the calling parent and that child id —
    otherwise a parent could edit another parent's child by guessing a UUID.
- **Caught a real bug while wiring that ownership check**: `AccessDeniedException` thrown
  from a service method does *not* get translated to a 403 by Spring Security's
  `ExceptionTranslationFilter` the way you'd expect — that filter sits outside
  `DispatcherServlet`, and our own `@RestControllerAdvice`'s catch-all
  `@ExceptionHandler(Exception.class)` resolves the exception first (inside the servlet's
  own dispatch loop), turning it into a 500 before Security's filter ever sees it. Added an
  explicit `AccessDeniedException` -> 403 handler to `GlobalExceptionHandler`. Same root
  cause as the `HttpMessageNotReadableException` fix from Phase 5 (the catch-all shadowing
  Spring's/Security's default handling) — worth remembering as a recurring shape of bug in
  this codebase's exception handling approach.
- New `/api/v1/parents/me/**` routes require the `PARENT` role in `SecurityConfig`.

### Website

- **Fixed the last of the three route-group issues** flagged back in Phase 5: `(parent)`
  was still a URL-prefix-less route group. Replaced with a real `parent/` folder — all
  three role areas (`tutor/`, `student/`, `parent/`) are now consistent, real URL segments.
- `ParentShell` (nav: My Children / Find a tutor / Profile).
- `/parent/profile` — edit own display name.
- `/parent/children` — list children, add-child form, inline edit-in-place per child (no
  separate `/children/[id]/edit` route — inline editing was simpler for this small a form
  and avoids an extra route just to toggle edit state).
- **Extracted the tutor search and detail experiences into shared components**
  (`TutorSearchExperience`, `TutorProfileDetail`) rather than duplicating Phase 6's
  student search page for the parent's "search on behalf of child" requirement (Phase 1
  IA: "same flow as Student"). The only thing that differs between `/student/search` +
  `/student/tutors/[id]` and `/parent/search` + `/parent/tutors/[id]` is the result-link
  target, which is now a single configurable prop (`tutorHref`) rather than two
  near-identical page files silently drifting apart over time.

## Known gaps

- **No route guards** (same gap noted in Phases 5-6) — still applies to `/parent/*`.
- **A child can't yet be "claimed" by a second parent or transferred** — the
  `parent_student_links` table supports many-to-many, but no UI/endpoint exists for a
  second parent to link to an existing child (e.g. both parents of the same kid). Not a
  blocker for MVP; revisit if real usage shows a need.
- **Search booking CTA is still disabled** (as in Phase 6) — booking itself is Phase 8, and
  the parent search flow inherits the same honestly-disabled button rather than a
  half-built booking flow.
- **Mobile parent screens**: not started, per the standing MVP sequencing decision.

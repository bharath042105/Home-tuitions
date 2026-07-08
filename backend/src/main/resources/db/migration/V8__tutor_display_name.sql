-- Phase 2's original tutor_profiles table had no name field at all - discovered
-- in Phase 6 when search results/profile pages needed something to show besides
-- bio/subjects/rate. Added as a new migration rather than editing V2, since V2 is
-- treated as already-applied history (Flyway migrations are immutable once shipped).
ALTER TABLE tutor_profiles ADD COLUMN display_name VARCHAR(150) NOT NULL DEFAULT '';
ALTER TABLE tutor_profiles ALTER COLUMN display_name DROP DEFAULT;

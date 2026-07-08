-- Phase 2's original student_profiles.user_id was NOT NULL, assuming every
-- Student is a fully independent User with their own login. Phase 7 (Parent
-- module) needs parent-added child sub-profiles that have no credentials of
-- their own (US-STU-02: "Parent account can link 1+ Student sub-profiles").
-- The users table's chk_email_or_phone constraint means we can't just create a
-- credential-less User row for each child either - so user_id must be nullable
-- here instead. UNIQUE(user_id) already tolerates multiple NULLs in Postgres,
-- so no constraint change needed there.
ALTER TABLE student_profiles ALTER COLUMN user_id DROP NOT NULL;

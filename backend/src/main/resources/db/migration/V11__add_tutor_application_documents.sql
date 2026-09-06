-- Add document URLs to tutor_applications table for storing S3 / Cloudflare R2 links
ALTER TABLE tutor_applications
    ADD COLUMN photo_url    TEXT,
    ADD COLUMN aadhaar_url  TEXT,
    ADD COLUMN degree_url   TEXT,
    ADD COLUMN resume_url   TEXT;

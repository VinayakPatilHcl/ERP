-- V3: extend clinic_settings with letterhead/branding fields.
ALTER TABLE clinic_settings
    ADD COLUMN IF NOT EXISTS registration         VARCHAR(64),
    ADD COLUMN IF NOT EXISTS logo_url             TEXT,
    ADD COLUMN IF NOT EXISTS letterhead_tagline   VARCHAR(200),
    ADD COLUMN IF NOT EXISTS invoice_footer       TEXT;

-- V2: seed default clinic settings and sample doctors.
-- The default admin user is created at startup by DataInitializer (password 'admin123').

INSERT INTO clinic_settings (clinic_name, address, phone, email, default_gst_percent, currency, invoice_prefix, created_at, updated_at, version)
VALUES ('Demo Hospital', '123 Main Street', '+91-0000000000', 'info@demo.local', 0, 'INR', 'INV', NOW(), NOW(), 0);

INSERT INTO doctors (name, specialization, qualification, registration_number, phone, consultation_fee, active, created_at, updated_at, version)
VALUES
('Dr. Asha Rao',  'General Physician', 'MBBS, MD', 'REG001', '+91-9999999991', 500.00, TRUE, NOW(), NOW(), 0),
('Dr. Vikram Singh', 'Ayurveda', 'BAMS, MD (Ayu)', 'REG002', '+91-9999999992', 600.00, TRUE, NOW(), NOW(), 0);

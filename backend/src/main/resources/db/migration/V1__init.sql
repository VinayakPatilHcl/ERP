-- V1: initial schema

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(64) NOT NULL UNIQUE,
    password VARCHAR(200) NOT NULL,
    full_name VARCHAR(200),
    email VARCHAR(200),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    version BIGINT
);

CREATE TABLE user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(32) NOT NULL,
    PRIMARY KEY (user_id, role)
);

CREATE TABLE doctors (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    specialization VARCHAR(200),
    qualification VARCHAR(100),
    registration_number VARCHAR(50),
    phone VARCHAR(20),
    email VARCHAR(200),
    consultation_fee NUMERIC(12,2),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    version BIGINT
);

CREATE TABLE patients (
    id BIGSERIAL PRIMARY KEY,
    mrn VARCHAR(32) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    gender VARCHAR(16),
    date_of_birth DATE,
    phone VARCHAR(20),
    email VARCHAR(200),
    address VARCHAR(500),
    blood_group VARCHAR(8),
    allergies VARCHAR(1000),
    medical_history TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    version BIGINT
);
CREATE INDEX idx_patients_mrn ON patients(mrn);
CREATE INDEX idx_patients_phone ON patients(phone);
CREATE INDEX idx_patients_name ON patients(first_name, last_name);

CREATE TABLE appointments (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL REFERENCES patients(id),
    doctor_id BIGINT NOT NULL REFERENCES doctors(id),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    token_number INT NOT NULL,
    status VARCHAR(32) NOT NULL,
    reason VARCHAR(500),
    is_follow_up BOOLEAN NOT NULL DEFAULT FALSE,
    parent_appointment_id BIGINT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    version BIGINT
);
CREATE INDEX idx_appt_date ON appointments(appointment_date);
CREATE INDEX idx_appt_doctor_date ON appointments(doctor_id, appointment_date);

CREATE TABLE consultations (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL REFERENCES patients(id),
    doctor_id BIGINT NOT NULL REFERENCES doctors(id),
    appointment_id BIGINT,
    consultation_date DATE NOT NULL,
    vitals_bp_systolic INT,
    vitals_bp_diastolic INT,
    vitals_pulse INT,
    vitals_temp_c DOUBLE PRECISION,
    vitals_resp_rate INT,
    vitals_spo2 INT,
    vitals_weight_kg DOUBLE PRECISION,
    vitals_height_cm DOUBLE PRECISION,
    symptoms TEXT,
    diagnosis TEXT,
    notes TEXT,
    diet_recommendation TEXT,
    panchakarma_recommendation TEXT,
    follow_up_notes TEXT,
    follow_up_date DATE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    version BIGINT
);
CREATE INDEX idx_cons_patient ON consultations(patient_id);
CREATE INDEX idx_cons_date ON consultations(consultation_date);

CREATE TABLE prescription_items (
    id BIGSERIAL PRIMARY KEY,
    consultation_id BIGINT NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
    medicine_name VARCHAR(200) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    duration VARCHAR(100),
    timing VARCHAR(100),
    instructions VARCHAR(500),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    version BIGINT
);

CREATE TABLE medicines (
    id BIGSERIAL PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    manufacturer VARCHAR(200),
    category VARCHAR(100),
    unit VARCHAR(50),
    unit_price NUMERIC(12,2),
    gst_percent NUMERIC(5,2) DEFAULT 0,
    stock_quantity INT NOT NULL DEFAULT 0,
    reorder_level INT,
    expiry_date DATE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    version BIGINT
);
CREATE INDEX idx_medicine_name ON medicines(name);

CREATE TABLE invoices (
    id BIGSERIAL PRIMARY KEY,
    invoice_number VARCHAR(32) NOT NULL UNIQUE,
    patient_id BIGINT NOT NULL REFERENCES patients(id),
    consultation_id BIGINT,
    invoice_date DATE NOT NULL,
    subtotal NUMERIC(14,2) NOT NULL,
    discount_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    tax_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(14,2) NOT NULL,
    paid_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL,
    notes VARCHAR(500),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    version BIGINT
);
CREATE INDEX idx_invoice_date ON invoices(invoice_date);

CREATE TABLE invoice_items (
    id BIGSERIAL PRIMARY KEY,
    invoice_id BIGINT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    item_type VARCHAR(32) NOT NULL,
    description VARCHAR(300) NOT NULL,
    hsn_sac VARCHAR(16),
    quantity NUMERIC(12,2) NOT NULL,
    unit_price NUMERIC(14,2) NOT NULL,
    discount_percent NUMERIC(5,2) DEFAULT 0,
    gst_percent NUMERIC(5,2) DEFAULT 0,
    line_total NUMERIC(14,2) NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    version BIGINT
);

CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    invoice_id BIGINT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    payment_date DATE NOT NULL,
    amount NUMERIC(14,2) NOT NULL,
    method VARCHAR(32) NOT NULL,
    reference_no VARCHAR(100),
    notes VARCHAR(300),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    version BIGINT
);

CREATE TABLE clinic_settings (
    id BIGSERIAL PRIMARY KEY,
    clinic_name VARCHAR(200) NOT NULL,
    address VARCHAR(500),
    phone VARCHAR(20),
    email VARCHAR(200),
    gstin VARCHAR(20),
    default_gst_percent NUMERIC(5,2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'INR',
    invoice_prefix VARCHAR(16) DEFAULT 'INV',
    rx_footer TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    version BIGINT
);

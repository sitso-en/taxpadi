-- TaxPadi Database Schema
-- V1: Initial schema

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- DOMAIN 1: Identity & Auth
-- ============================================================

CREATE TABLE users (
    user_id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name            VARCHAR(150) NOT NULL,
    email                VARCHAR(150) UNIQUE,
    phone                VARCHAR(20)  NOT NULL UNIQUE,
    password_hash        VARCHAR(255) NOT NULL,
    tin                  VARCHAR(20)  UNIQUE,
    region               VARCHAR(100),
    taxpayer_category    VARCHAR(30)  NOT NULL,
    subscription_tier    VARCHAR(20)  NOT NULL DEFAULT 'FREE',
    role                 VARCHAR(20)  NOT NULL DEFAULT 'USER',
    active_profile_id    UUID,
    is_active            BOOLEAN DEFAULT TRUE,
    is_verified          BOOLEAN DEFAULT FALSE,
    notification_preferences JSONB DEFAULT '{"deadline_reminders":true,"penalty_alerts":true,"vault_suggestions":true,"referral_offers":true,"payment_confirmations":true,"system_updates":true}',
    created_at           TIMESTAMP NOT NULL,
    updated_at           TIMESTAMP NOT NULL
);

CREATE TABLE user_tax_profiles (
    profile_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    vat_registered       BOOLEAN DEFAULT FALSE,
    vat_registration_no  VARCHAR(30),
    paye_registered      BOOLEAN DEFAULT FALSE,
    nhil_registered      BOOLEAN DEFAULT FALSE,
    tax_year_start       DATE,
    onboarding_complete  BOOLEAN DEFAULT FALSE,
    created_at           TIMESTAMP NOT NULL,
    updated_at           TIMESTAMP NOT NULL
);

CREATE TABLE otp_verifications (
    otp_id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    otp_code             VARCHAR(10) NOT NULL,
    purpose              VARCHAR(20) NOT NULL,
    expires_at           TIMESTAMP NOT NULL,
    used                 BOOLEAN NOT NULL DEFAULT FALSE,
    reset_token_hash     VARCHAR(64),
    created_at           TIMESTAMP NOT NULL
);

CREATE TABLE refresh_tokens (
    token_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    token_hash           VARCHAR(255) NOT NULL UNIQUE,
    device_info          VARCHAR(255),
    ip_address           VARCHAR(45),
    expires_at           TIMESTAMP NOT NULL,
    revoked              BOOLEAN NOT NULL DEFAULT FALSE,
    revoked_at           TIMESTAMP,
    created_at           TIMESTAMP NOT NULL
);

-- ============================================================
-- DOMAIN 2: Financial Activity
-- ============================================================

CREATE TABLE transactions (
    transaction_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                  UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    type                     VARCHAR(10) NOT NULL,
    amount                   NUMERIC(15,2) NOT NULL,
    category                 VARCHAR(50) NOT NULL,
    description              TEXT,
    entry_method             VARCHAR(20) NOT NULL,
    receipt_url              VARCHAR(500),
    tax_deductible           BOOLEAN NOT NULL DEFAULT FALSE,
    withholding_applicable   BOOLEAN NOT NULL DEFAULT FALSE,
    withholding_amount       NUMERIC(15,2) DEFAULT 0,
    withholding_remitted     BOOLEAN NOT NULL DEFAULT FALSE,
    withholding_remitted_at  TIMESTAMP,
    transaction_date         DATE NOT NULL,
    created_at               TIMESTAMP NOT NULL,
    updated_at               TIMESTAMP NOT NULL
);

CREATE TABLE invoices (
    invoice_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    transaction_id       UUID REFERENCES transactions(transaction_id),
    client_name          VARCHAR(150) NOT NULL,
    client_email         VARCHAR(150),
    client_phone         VARCHAR(20),
    invoice_ref          VARCHAR(50) NOT NULL UNIQUE,
    description          TEXT NOT NULL,
    subtotal             NUMERIC(15,2) NOT NULL,
    vat_amount           NUMERIC(15,2) DEFAULT 0,
    total_amount         NUMERIC(15,2) NOT NULL,
    status               VARCHAR(20) NOT NULL DEFAULT 'unpaid',
    due_date             DATE,
    paid_at              TIMESTAMP,
    sent_via             VARCHAR(20),
    sent_at              TIMESTAMP,
    pdf_url              VARCHAR(500),
    cancelled_at         TIMESTAMP,
    cancel_reason        VARCHAR(500),
    created_at           TIMESTAMP,
    updated_at           TIMESTAMP
);

-- ============================================================
-- DOMAIN 3: Tax Engine
-- ============================================================

CREATE TABLE tax_calculations (
    calculation_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    tax_type             VARCHAR(20) NOT NULL,
    period_start         DATE NOT NULL,
    period_end           DATE NOT NULL,
    gross_income         NUMERIC(15,2) NOT NULL DEFAULT 0,
    total_deductions     NUMERIC(15,2) NOT NULL DEFAULT 0,
    taxable_income       NUMERIC(15,2) NOT NULL DEFAULT 0,
    tax_liability        NUMERIC(15,2) NOT NULL DEFAULT 0,
    calculated_at        TIMESTAMP
);

CREATE TABLE tax_returns (
    return_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    calculation_id       UUID,
    tax_type             VARCHAR(20) NOT NULL,
    tax_year             INTEGER NOT NULL,
    period_start         DATE NOT NULL,
    period_end           DATE NOT NULL,
    gross_income         NUMERIC(15,2) NOT NULL DEFAULT 0,
    total_deductions     NUMERIC(15,2) NOT NULL DEFAULT 0,
    taxable_income       NUMERIC(15,2) NOT NULL DEFAULT 0,
    tax_liability        NUMERIC(15,2) NOT NULL DEFAULT 0,
    status               VARCHAR(20) NOT NULL DEFAULT 'draft',
    submitted_at         TIMESTAMP,
    gra_reference        VARCHAR(100),
    amendment_reason     VARCHAR(500),
    amended_at           TIMESTAMP,
    created_at           TIMESTAMP NOT NULL,
    updated_at           TIMESTAMP NOT NULL,
    UNIQUE (user_id, tax_type, period_start, period_end)
);

CREATE TABLE vat_records (
    vat_id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    month                INTEGER NOT NULL,
    year                 INTEGER NOT NULL,
    total_sales          NUMERIC(15,2) NOT NULL,
    output_vat           NUMERIC(15,2) NOT NULL,
    total_purchases      NUMERIC(15,2) NOT NULL,
    input_vat            NUMERIC(15,2) NOT NULL,
    net_vat_liability    NUMERIC(15,2) NOT NULL,
    return_status        VARCHAR(20) NOT NULL,
    due_date             DATE,
    submitted_at         TIMESTAMP,
    created_at           TIMESTAMP NOT NULL,
    updated_at           TIMESTAMP NOT NULL,
    UNIQUE (user_id, month, year)
);

CREATE TABLE employees (
    employee_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    full_name            VARCHAR(150) NOT NULL,
    position             VARCHAR(100),
    gross_salary         NUMERIC(15,2) NOT NULL,
    transport_allowance  NUMERIC(15,2) NOT NULL DEFAULT 0,
    housing_allowance    NUMERIC(15,2) NOT NULL DEFAULT 0,
    other_allowances     NUMERIC(15,2) NOT NULL DEFAULT 0,
    social_security_no   VARCHAR(30),
    start_date           DATE NOT NULL,
    end_date             DATE,
    is_active            BOOLEAN NOT NULL DEFAULT TRUE,
    created_at           TIMESTAMP NOT NULL,
    updated_at           TIMESTAMP NOT NULL
);

CREATE TABLE paye_records (
    paye_id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id          UUID NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
    user_id              UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    month                INTEGER NOT NULL,
    year                 INTEGER NOT NULL,
    gross_salary         NUMERIC(15,2) NOT NULL,
    taxable_salary       NUMERIC(15,2) NOT NULL,
    paye_deducted        NUMERIC(15,2) NOT NULL,
    remitted             BOOLEAN NOT NULL DEFAULT FALSE,
    remitted_at          TIMESTAMP,
    created_at           TIMESTAMP NOT NULL,
    updated_at           TIMESTAMP NOT NULL,
    UNIQUE (employee_id, month, year)
);

CREATE TABLE penalties (
    penalty_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    tax_type             VARCHAR(255) NOT NULL,
    penalty_type         VARCHAR(255) NOT NULL,
    original_tax_amount  NUMERIC(15,2) NOT NULL,
    penalty_amount       NUMERIC(15,2) NOT NULL,
    penalty_rate         NUMERIC(5,4),
    due_date             DATE NOT NULL,
    filing_date          DATE NOT NULL,
    days_late            INTEGER NOT NULL DEFAULT 0,
    status               VARCHAR(255) NOT NULL,
    description          VARCHAR(255),
    reference_number     VARCHAR(255),
    paid_at              TIMESTAMP,
    created_at           TIMESTAMP NOT NULL,
    updated_at           TIMESTAMP
);

CREATE TABLE tax_deadlines (
    deadline_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title                VARCHAR(255) NOT NULL,
    tax_type             VARCHAR(255) NOT NULL,
    description          VARCHAR(1000) NOT NULL,
    due_date             DATE NOT NULL,
    frequency            VARCHAR(255) NOT NULL,
    status               VARCHAR(255) NOT NULL,
    applicable_to        VARCHAR(255) NOT NULL,
    penalty_description  VARCHAR(255),
    user_id              UUID REFERENCES users(user_id),
    period_start         DATE,
    period_end           DATE,
    completed            BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at         TIMESTAMP,
    is_active            BOOLEAN NOT NULL DEFAULT TRUE,
    created_at           TIMESTAMP NOT NULL,
    updated_at           TIMESTAMP
);

-- ============================================================
-- DOMAIN 4: Payments & Vault
-- ============================================================

CREATE TABLE compliance_certificates (
    certificate_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    certificate_number   VARCHAR(255) NOT NULL UNIQUE,
    certificate_type     VARCHAR(255) NOT NULL,
    status               VARCHAR(255) NOT NULL,
    issue_date           DATE,
    expiry_date          DATE,
    issued_by            VARCHAR(255),
    tin_number           VARCHAR(255),
    business_name        VARCHAR(255),
    download_url         VARCHAR(255),
    remarks              VARCHAR(255),
    requested_at         TIMESTAMP NOT NULL,
    issued_at            TIMESTAMP,
    created_at           TIMESTAMP NOT NULL
);

CREATE TABLE payments (
    payment_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    return_id            UUID REFERENCES tax_returns(return_id),
    penalty_id           UUID REFERENCES penalties(penalty_id),
    certificate_id       UUID REFERENCES compliance_certificates(certificate_id),
    amount               NUMERIC(15,2) NOT NULL,
    payment_method       VARCHAR(255) NOT NULL,
    payment_reference    VARCHAR(255),
    momo_number          VARCHAR(255),
    momo_provider        VARCHAR(255),
    status               VARCHAR(255) NOT NULL DEFAULT 'pending',
    paid_at              TIMESTAMP,
    expires_at           TIMESTAMP,
    created_at           TIMESTAMP NOT NULL,
    updated_at           TIMESTAMP NOT NULL
);

CREATE TABLE savings_vault (
    vault_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    vault_name           VARCHAR(255) NOT NULL,
    balance              NUMERIC(15,2) NOT NULL DEFAULT 0,
    target_amount        NUMERIC(15,2) NOT NULL DEFAULT 0,
    auto_save_amount     NUMERIC(15,2) NOT NULL DEFAULT 0,
    auto_save_frequency  VARCHAR(255) NOT NULL DEFAULT 'MONTHLY',
    auto_save_enabled    BOOLEAN NOT NULL DEFAULT FALSE,
    status               VARCHAR(255) NOT NULL DEFAULT 'ACTIVE',
    purpose              VARCHAR(255),
    linked_momo_number   VARCHAR(255),
    linked_momo_provider VARCHAR(255),
    created_at           TIMESTAMP NOT NULL,
    updated_at           TIMESTAMP
);

CREATE TABLE vault_transactions (
    transaction_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vault_id             UUID NOT NULL REFERENCES savings_vault(vault_id) ON DELETE CASCADE,
    type                 VARCHAR(255) NOT NULL,
    amount               NUMERIC(15,2) NOT NULL,
    balance_after        NUMERIC(15,2) NOT NULL,
    description          VARCHAR(255),
    reference            VARCHAR(255),
    trigger              VARCHAR(255) NOT NULL DEFAULT 'MANUAL',
    momo_reference       VARCHAR(255),
    status               VARCHAR(255) NOT NULL DEFAULT 'PENDING',
    confirmed_at         TIMESTAMP,
    created_at           TIMESTAMP NOT NULL
);

-- ============================================================
-- DOMAIN 5: Platform & Config
-- ============================================================

CREATE TABLE subscriptions (
    subscription_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    plan                 VARCHAR(255) NOT NULL,
    status               VARCHAR(255) NOT NULL,
    subscription_tier    VARCHAR(255) NOT NULL DEFAULT 'FREE',
    payment_method       VARCHAR(255),
    amount               NUMERIC(10,2),
    currency             VARCHAR(255) NOT NULL DEFAULT 'GHS',
    payment_reference    VARCHAR(255),
    momo_number          VARCHAR(255),
    auto_renew           BOOLEAN DEFAULT TRUE,
    started_at           TIMESTAMP,
    expires_at           TIMESTAMP,
    cancelled_at         TIMESTAMP,
    cancel_reason        VARCHAR(255),
    created_at           TIMESTAMP NOT NULL,
    updated_at           TIMESTAMP NOT NULL
);

CREATE TABLE audit_logs (
    log_id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    action               VARCHAR(300),
    detail               VARCHAR(1000),
    ip_address           VARCHAR(30),
    created_at           TIMESTAMP
);

CREATE TABLE referral_offers (
    offer_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    offer_type           VARCHAR(255) NOT NULL DEFAULT 'LOAN',
    partner_name         VARCHAR(100) NOT NULL,
    product_name         VARCHAR(150) NOT NULL,
    max_amount           NUMERIC(15,2),
    interest_rate        NUMERIC(5,2),
    description          VARCHAR(1000),
    deep_link            VARCHAR(500),
    partner_reference    VARCHAR(150),
    status               VARCHAR(255) NOT NULL DEFAULT 'ACTIVE',
    converted_at         TIMESTAMP,
    expires_at           TIMESTAMP,
    created_at           TIMESTAMP NOT NULL,
    updated_at           TIMESTAMP NOT NULL
);

CREATE TABLE taxbot_conversations (
    conversation_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    question             TEXT,
    answer               TEXT,
    created_at           TIMESTAMP
);

CREATE TABLE import_history (
    import_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    provider             VARCHAR(30) NOT NULL,
    statement_from       DATE NOT NULL,
    statement_to         DATE NOT NULL,
    total_imported       INTEGER NOT NULL DEFAULT 0,
    total_skipped        INTEGER NOT NULL DEFAULT 0,
    imported_at          TIMESTAMP
);

CREATE TABLE device_tokens (
    token_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    token_hash           VARCHAR(64) NOT NULL UNIQUE,
    device_info          VARCHAR(255),
    fcm_token            VARCHAR(500),
    platform             VARCHAR(20),
    is_active            BOOLEAN NOT NULL DEFAULT TRUE,
    created_at           TIMESTAMP NOT NULL
);

CREATE TABLE notifications (
    notification_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title                VARCHAR(150),
    body                 VARCHAR(1000),
    type                 VARCHAR(255),
    read                 BOOLEAN DEFAULT FALSE,
    action_url           VARCHAR(500),
    created_at           TIMESTAMP
);

CREATE TABLE partners (
    partner_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                 VARCHAR(255) NOT NULL,
    offer_type           VARCHAR(20) NOT NULL,
    api_key_hash         VARCHAR(255) NOT NULL,
    eligibility_threshold JSONB,
    is_active            BOOLEAN DEFAULT TRUE,
    total_offers_generated INTEGER NOT NULL DEFAULT 0,
    total_converted      INTEGER NOT NULL DEFAULT 0,
    created_at           TIMESTAMP
);

CREATE TABLE tax_rate_configs (
    config_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tax_year             INTEGER NOT NULL,
    income_tax_brackets  JSONB,
    vat_standard_rate    NUMERIC(5,2),
    vat_nhil_levy        NUMERIC(5,2),
    vat_getfund_levy     NUMERIC(5,2),
    vat_covid_levy       NUMERIC(5,2),
    vat_registration_threshold NUMERIC(15,2),
    withholding_rates    JSONB,
    updated_by           UUID,
    updated_at           TIMESTAMP,
    created_at           TIMESTAMP NOT NULL
);

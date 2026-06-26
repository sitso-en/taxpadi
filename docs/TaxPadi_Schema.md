# TaxPadi — Database Schema Documentation
**Version 1.0 | April 2026**
Group 104 | KNUST Department of Computer Science

---

## Overview

This document defines the complete PostgreSQL database schema for TaxPadi Version 1.0. It covers all 26 tables, their columns, constraints, relationships, and the design reasoning behind key decisions. This schema is the single source of truth for all backend development and must be referenced before any table is created, modified, or queried.

The schema is organized around five functional domains:

| Domain | Tables | Purpose |
|---|---|---|
| Identity and Auth | users, user_tax_profiles, otp_verifications, refresh_tokens | Who the user is, how they are configured, and how they authenticate |
| Financial Activity | transactions, invoices | Every income and expense movement and client invoice |
| Tax Engine | tax_calculations, tax_returns, vat_records, paye_records, employees, penalties, tax_deadlines | All tax computation, filing, and compliance tracking |
| Payments and Vault | payments, compliance_certificates, savings_vault, vault_transactions | Tax payments, proof of compliance, and savings management |
| Platform | audit_logs, referral_offers, taxbot_conversations | System-wide activity logging, financial product referrals, and TaxBot history |
| Subscriptions & Config | subscriptions, import_history, device_tokens, notifications, partners, tax_rate_configs | Subscription management, import tracking, push notifications, partner config, and tax rate versioning |

---

## Conventions

The following conventions apply across all tables in this schema:

| Convention | Detail |
|---|---|
| Primary keys | All primary keys are UUID type generated with `gen_random_uuid()`. Never auto-increment integers. |
| Money columns | All monetary values use `NUMERIC(15, 2)` — never `FLOAT` or `DECIMAL` without precision. |
| Timestamps | `created_at` defaults to `NOW()`. `updated_at` is present on mutable tables and must be updated by the application on every write. |
| Soft deletes | Records with dependent history are never hard deleted. `is_active` or `revoked` boolean flags are used instead. |
| Foreign keys | All foreign keys use `ON DELETE CASCADE` unless the child record must survive parent deletion, in which case `ON DELETE SET NULL` is used. |
| CHECK constraints | All controlled value columns use CHECK constraints at the database level. Application-layer validation is additional, not a replacement. |
| Immutable tables | Tables that must never be updated after creation — `audit_logs`, `compliance_certificates` — have no `updated_at` column by design. |

---

## Domain 1 — Identity and Authentication

### Table 1: users

The central identity table. Almost every other table in the schema references this one. Stores credentials, contact details, taxpayer category, and account status.

```sql
CREATE TABLE users (
    user_id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name                  VARCHAR(150) NOT NULL,
    email                      VARCHAR(150) UNIQUE,
    phone                      VARCHAR(20)  NOT NULL UNIQUE,
    password_hash              VARCHAR(255) NOT NULL,
    tin                        VARCHAR(20)  UNIQUE,
    region                     VARCHAR(100),
    taxpayer_category          VARCHAR(30)  NOT NULL
                               CHECK (taxpayer_category IN (
                                 'individual', 'sole_trader', 'small_business')),
    subscription_tier          VARCHAR(20)  NOT NULL DEFAULT 'free'
                               CHECK (subscription_tier IN ('free', 'paid')),
    role                       VARCHAR(20)  NOT NULL DEFAULT 'user'
                               CHECK (role IN ('user', 'admin')),
    active_profile_id          UUID,
    is_active                  BOOLEAN DEFAULT TRUE,
    is_verified                BOOLEAN DEFAULT FALSE,
    notification_preferences   JSONB DEFAULT '{"deadline_reminders": true, "penalty_alerts": true, "vault_suggestions": true, "referral_offers": true, "payment_confirmations": true, "system_updates": true}',
    created_at                 TIMESTAMP DEFAULT NOW(),
    updated_at                 TIMESTAMP DEFAULT NOW()
);
```

| Column | Type | Notes |
|---|---|---|
| user_id | UUID PK | Generated automatically. Never exposed in URLs. |
| email | VARCHAR UNIQUE | Nullable. Many Ghanaian users do not have or use email. |
| phone | VARCHAR UNIQUE NOT NULL | Primary identifier. Used for OTP, MoMo, and GRA contact. |
| password_hash | VARCHAR NOT NULL | BCrypt hash. Raw password never stored. |
| tin | VARCHAR UNIQUE | Nullable. User may not have a TIN at registration. App prompts them to obtain one. |
| taxpayer_category | VARCHAR CHECK | Determines tax rate brackets, deadlines, and deductibles assigned at onboarding. |
| subscription_tier | VARCHAR CHECK | Controls feature access. Defaults to free on registration. |
| role | VARCHAR CHECK | `user` for all regular accounts. `admin` for platform administrators. |
| active_profile_id | UUID | References the currently active user_tax_profile. Set on profile switch. |
| is_active | BOOLEAN | False means account is deactivated. Data retained for 6-year audit window. |
| is_verified | BOOLEAN | True after phone OTP verified at registration. |
| notification_preferences | JSONB | User notification settings. penalty_alerts cannot be disabled. |

---

### Table 2: user_tax_profiles

Stores tax-specific configuration for each user. Separated from `users` because tax registration status changes independently of identity data.

```sql
CREATE TABLE user_tax_profiles (
    profile_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL UNIQUE
                        REFERENCES users(user_id) ON DELETE CASCADE,
    vat_registered      BOOLEAN DEFAULT FALSE,
    vat_registration_no VARCHAR(30),
    paye_registered     BOOLEAN DEFAULT FALSE,
    nhil_registered     BOOLEAN DEFAULT FALSE,
    tax_year_start      DATE,
    onboarding_complete BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);
```

| Column | Type | Notes |
|---|---|---|
| user_id | UUID UNIQUE FK | One-to-one with users. UNIQUE enforces one profile per user. |
| vat_registered | BOOLEAN | Flipped to true when user crosses GHS 200,000 threshold and confirms registration. |
| paye_registered | BOOLEAN | True when user has at least one active employee. |
| nhil_registered | BOOLEAN | National Health Insurance Levy registration status. |
| tax_year_start | DATE | Standard is January 1st. Some businesses use a different financial year start. |
| onboarding_complete | BOOLEAN | False until user finishes the full onboarding flow. Controls which screens the app shows. |

---

### Table 3: otp_verifications

Temporary storage for one-time passwords used in phone verification, two-factor login, and password reset flows.

```sql
CREATE TABLE otp_verifications (
    otp_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    otp_code    VARCHAR(10) NOT NULL,
    purpose     VARCHAR(20) NOT NULL
                CHECK (purpose IN ('login', 'register', 'password_reset')),
    expires_at  TIMESTAMP NOT NULL,
    used        BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT NOW()
);
```

| Column | Type | Notes |
|---|---|---|
| otp_code | VARCHAR NOT NULL | The actual OTP sent via SMS. Expires in minutes and has no value after use. |
| purpose | VARCHAR CHECK | `login`: 2FA on sign in. `register`: phone verification. `password_reset`: forgot password flow. |
| expires_at | TIMESTAMP NOT NULL | Typically NOW() + 10 minutes. Backend rejects OTPs past this time. |
| used | BOOLEAN | Flipped to true after successful verification. Prevents OTP reuse. |

---

### Table 4: refresh_tokens

Manages active user sessions. Enables multi-device login, session revocation, remote account lock, and new device notifications.

```sql
CREATE TABLE refresh_tokens (
    token_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    token_hash  VARCHAR(255) NOT NULL UNIQUE,
    device_info VARCHAR(255),
    ip_address  VARCHAR(45),
    expires_at  TIMESTAMP NOT NULL,
    revoked     BOOLEAN DEFAULT FALSE,
    revoked_at  TIMESTAMP,
    created_at  TIMESTAMP DEFAULT NOW()
);
```

| Column | Type | Notes |
|---|---|---|
| token_hash | VARCHAR UNIQUE NOT NULL | BCrypt hash of the raw refresh token. Raw token never stored. |
| device_info | VARCHAR | Device name and OS displayed in the Active Sessions screen for user identification. |
| ip_address | VARCHAR | Used for security monitoring and new device detection. |
| expires_at | TIMESTAMP NOT NULL | Typically 30 to 90 days. Nightly job cleans up expired revoked records. |
| revoked | BOOLEAN | True on logout, password change, or manual session kill. Prevents further use of the token. |

---

## Domain 2 — Financial Activity

### Table 5: transactions

The most used table in the system. Every income and expense entry — whether logged manually, via voice, scanned from a receipt, imported from a MoMo statement, or created automatically from a paid invoice — creates a row here. The tax calculation engine reads primarily from this table.

```sql
CREATE TABLE transactions (
    transaction_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    type             VARCHAR(10) NOT NULL
                     CHECK (type IN ('income', 'expense')),
    amount           NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    category         VARCHAR(50) NOT NULL,
    description      VARCHAR(255),
    entry_method     VARCHAR(20) NOT NULL
                     CHECK (entry_method IN (
                       'manual', 'voice', 'scan', 'import', 'invoice')),
    receipt_url      VARCHAR(500),
    tax_deductible          BOOLEAN DEFAULT FALSE,
    withholding_applicable  BOOLEAN DEFAULT FALSE,
    withholding_amount      NUMERIC(15, 2) DEFAULT 0,
    withholding_remitted    BOOLEAN DEFAULT FALSE,
    withholding_remitted_at TIMESTAMP,
    transaction_date        DATE NOT NULL,
    created_at              TIMESTAMP DEFAULT NOW(),
    updated_at              TIMESTAMP DEFAULT NOW()
);
```

| Column | Type | Notes |
|---|---|---|
| type | VARCHAR CHECK | `income` or `expense`. Determines direction of tax impact. |
| amount | NUMERIC(15,2) | Never FLOAT. Precise to the pesewa. `CHECK (amount > 0)` prevents zero or negative entries. |
| category | VARCHAR NOT NULL | Predefined categories enforced at application layer by Spring Boot enum based on taxpayer_category. |
| entry_method | VARCHAR CHECK | Tracks how the transaction entered the system. Used in audit trail and analytics. |
| receipt_url | VARCHAR | S3 URL of scanned receipt image. Nullable for non-scan entries. |
| tax_deductible | BOOLEAN | True for legitimate business expenses that reduce taxable income. App suggests based on category, user confirms. |
| withholding_applicable | BOOLEAN | True when the transaction attracts withholding tax. Set by user at logging or suggested by category. |
| withholding_amount | NUMERIC(15,2) | The computed withholding tax amount. Derived from category rate applied to transaction amount. |
| withholding_remitted | BOOLEAN | True when the employer has remitted the withheld amount to GRA. |
| transaction_date | DATE NOT NULL | When the money actually moved. May differ from `created_at` if user logs retrospectively. |

---

### Table 6: invoices

Stores client invoices created by users. When an invoice is marked as paid a linked transaction is automatically created, feeding the tax calculation engine without any manual entry from the user.

```sql
CREATE TABLE invoices (
    invoice_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    transaction_id  UUID REFERENCES transactions(transaction_id) ON DELETE SET NULL,
    client_name     VARCHAR(150) NOT NULL,
    client_email    VARCHAR(150),
    client_phone    VARCHAR(20),
    invoice_ref     VARCHAR(50) NOT NULL UNIQUE,
    description     TEXT NOT NULL,
    subtotal        NUMERIC(15, 2) NOT NULL CHECK (subtotal > 0),
    vat_amount      NUMERIC(15, 2) DEFAULT 0,
    total_amount    NUMERIC(15, 2) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'unpaid'
                    CHECK (status IN ('unpaid', 'paid', 'cancelled')),
    due_date        DATE,
    paid_at         TIMESTAMP,
    sent_via        VARCHAR(20)
                    CHECK (sent_via IN ('whatsapp', 'email', 'download')),
    sent_at         TIMESTAMP,
    pdf_url         VARCHAR(500),
    cancelled_at    TIMESTAMP,
    cancel_reason   VARCHAR(500),
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);
```

| Column | Type | Notes |
|---|---|---|
| transaction_id | UUID FK | Null until invoice is marked paid. Populated automatically when paid status is set. |
| invoice_ref | VARCHAR UNIQUE NOT NULL | Human-readable reference e.g. `INV-2024-00123`. Printed on the PDF document. |
| subtotal | NUMERIC(15,2) | Pre-VAT amount. For non-VAT users equals total_amount. |
| vat_amount | NUMERIC(15,2) | VAT charged on the invoice. Zero for non-VAT registered users. |
| sent_via | VARCHAR CHECK | Records delivery channel for audit trail. Nullable if invoice was not yet sent. |
| pdf_url | VARCHAR | S3 URL of generated invoice PDF. Populated after first generation. |

---

## Domain 3 — Tax Engine

### Table 7: tax_calculations

Stores the live running tax liability for each user per tax type per period. Updated on every relevant transaction write. Powers the live tax liability meter on the dashboard.

> **Note:** `tax_calculations` is a living record that updates continuously. `tax_returns` is a frozen snapshot of what was filed. They are not the same thing.

```sql
CREATE TABLE tax_calculations (
    calculation_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    tax_type         VARCHAR(20) NOT NULL
                     CHECK (tax_type IN (
                       'income_tax', 'vat', 'paye', 'withholding')),
    period_start     DATE NOT NULL,
    period_end       DATE NOT NULL,
    gross_income     NUMERIC(15, 2) NOT NULL DEFAULT 0,
    total_deductions NUMERIC(15, 2) NOT NULL DEFAULT 0,
    taxable_income   NUMERIC(15, 2) NOT NULL DEFAULT 0,
    tax_liability    NUMERIC(15, 2) NOT NULL DEFAULT 0,
    calculated_at    TIMESTAMP DEFAULT NOW(),
    UNIQUE (user_id, tax_type, period_start, period_end)
);
```

| Column | Type | Notes |
|---|---|---|
| tax_type | VARCHAR CHECK | Each tax type has its own row so changes to one do not trigger recalculation of others. |
| period_start / period_end | DATE NOT NULL | Annual for income tax. Monthly for VAT and PAYE. Defines the exact calculation window. |
| gross_income | NUMERIC(15,2) | Total income before deductions for the period. |
| total_deductions | NUMERIC(15,2) | Sum of all `tax_deductible` expense transactions for the period. |
| taxable_income | NUMERIC(15,2) | `gross_income` minus `total_deductions`. The base on which the tax rate is applied. |
| tax_liability | NUMERIC(15,2) | The final computed tax owed. This is what the live meter displays. |
| UNIQUE constraint | Composite | Prevents duplicate calculations per user per tax type per period. Engine updates existing row rather than inserting a new one. |

---

### Table 8: tax_returns

Frozen snapshots of filed tax returns. Once submitted the figures on this record never change — even if subsequent transactions alter the underlying `tax_calculation`. This is the legal declaration made to GRA.

```sql
CREATE TABLE tax_returns (
    return_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    calculation_id   UUID REFERENCES tax_calculations(calculation_id),
    tax_type         VARCHAR(20) NOT NULL
                     CHECK (tax_type IN (
                       'income_tax', 'vat', 'paye', 'withholding')),
    tax_year         INTEGER NOT NULL,
    period_start     DATE NOT NULL,
    period_end       DATE NOT NULL,
    gross_income     NUMERIC(15, 2) NOT NULL DEFAULT 0,
    total_deductions NUMERIC(15, 2) NOT NULL DEFAULT 0,
    taxable_income   NUMERIC(15, 2) NOT NULL DEFAULT 0,
    tax_liability    NUMERIC(15, 2) NOT NULL DEFAULT 0,
    status           VARCHAR(20) NOT NULL DEFAULT 'draft'
                     CHECK (status IN (
                       'draft', 'submitted', 'accepted', 'rejected')),
    submitted_at      TIMESTAMP,
    gra_reference     VARCHAR(100),
    amendment_reason  VARCHAR(500),
    amended_at        TIMESTAMP,
    created_at        TIMESTAMP DEFAULT NOW(),
    updated_at        TIMESTAMP DEFAULT NOW(),
    UNIQUE (user_id, tax_type, period_start, period_end)
);
```

| Column | Type | Notes |
|---|---|---|
| calculation_id | UUID FK | Links the return to the calculation it was generated from. Nullable because the calculation may be updated after filing. |
| tax_year | INTEGER NOT NULL | The calendar year this return covers e.g. 2024. |
| gross_income etc. | NUMERIC(15,2) | Figures copied from tax_calculation at time of return generation. Immutable after submission. |
| status | VARCHAR CHECK | `draft`: generated not yet submitted. `submitted`: sent to GRA portal. `accepted`: GRA confirmed. `rejected`: GRA rejected, requires resubmission. |
| gra_reference | VARCHAR | Nullable. The acknowledgement reference number from GRA portal. Entered manually by the user after submission. |

---

### Table 9: vat_records

Monthly VAT position for VAT-registered users. Tracks output VAT collected from customers and input VAT paid on expenses. The net difference is what gets remitted to GRA monthly.

> **Note:** Ghana's effective VAT rate is 21% — comprising 15% standard VAT, 2.5% NHIL, 2.5% GetFund, and 1% COVID-19 levy. This rate is hardcoded in the Spring Boot tax engine, not stored in the database.

```sql
CREATE TABLE vat_records (
    vat_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id            UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    month              INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year               INTEGER NOT NULL,
    total_sales        NUMERIC(15, 2) NOT NULL DEFAULT 0,
    output_vat         NUMERIC(15, 2) NOT NULL DEFAULT 0,
    total_purchases    NUMERIC(15, 2) NOT NULL DEFAULT 0,
    input_vat          NUMERIC(15, 2) NOT NULL DEFAULT 0,
    net_vat_liability  NUMERIC(15, 2) NOT NULL DEFAULT 0,
    return_status      VARCHAR(20) NOT NULL DEFAULT 'pending'
                       CHECK (return_status IN (
                         'pending', 'submitted', 'accepted', 'rejected')),
    due_date           DATE,
    submitted_at       TIMESTAMP,
    created_at         TIMESTAMP DEFAULT NOW(),
    updated_at         TIMESTAMP DEFAULT NOW(),
    UNIQUE (user_id, month, year)
);
```

---

### Table 10: employees

Stores the employer's staff for PAYE calculation. Soft deleted via `is_active` to preserve historical PAYE records when an employee leaves.

```sql
CREATE TABLE employees (
    employee_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    full_name            VARCHAR(150) NOT NULL,
    position             VARCHAR(100),
    gross_salary         NUMERIC(15, 2) NOT NULL CHECK (gross_salary > 0),
    transport_allowance  NUMERIC(15, 2) DEFAULT 0,
    housing_allowance    NUMERIC(15, 2) DEFAULT 0,
    other_allowances     NUMERIC(15, 2) DEFAULT 0,
    social_security_no   VARCHAR(30),
    start_date           DATE NOT NULL,
    end_date             DATE,
    is_active            BOOLEAN DEFAULT TRUE,
    created_at           TIMESTAMP DEFAULT NOW(),
    updated_at           TIMESTAMP DEFAULT NOW()
);
```

| Column | Type | Notes |
|---|---|---|
| transport_allowance | NUMERIC(15,2) | Tax exempt up to GRA-defined threshold. Stored separately so PAYE engine applies correct exemption. |
| housing_allowance | NUMERIC(15,2) | Partially exempt. Must be separate from gross_salary for accurate PAYE calculation. |
| social_security_no | VARCHAR | Nullable. SSNIT registration legally required but many informal businesses have not yet registered staff. |
| is_active | BOOLEAN | False when employee leaves. Soft delete preserves historical paye_records. Never hard delete an employee with history. |

---

### Table 11: paye_records

Monthly PAYE deduction record per employee. Feeds the annual PAYE return auto-generated by March 31st each year.

```sql
CREATE TABLE paye_records (
    paye_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id    UUID NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
    user_id        UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    month          INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year           INTEGER NOT NULL,
    gross_salary   NUMERIC(15, 2) NOT NULL,
    taxable_salary NUMERIC(15, 2) NOT NULL,
    paye_deducted  NUMERIC(15, 2) NOT NULL DEFAULT 0,
    remitted       BOOLEAN DEFAULT FALSE,
    remitted_at    TIMESTAMP,
    created_at     TIMESTAMP DEFAULT NOW(),
    updated_at     TIMESTAMP DEFAULT NOW(),
    UNIQUE (employee_id, month, year)
);
```

| Column | Type | Notes |
|---|---|---|
| user_id | UUID FK | Denormalized from employees for query performance. Avoids JOIN on every employer PAYE query. |
| gross_salary | NUMERIC(15,2) | Copied from employees at calculation time. Frozen so historical records survive future salary changes. |
| taxable_salary | NUMERIC(15,2) | `gross_salary` minus exempt allowances. PAYE is calculated on this figure not `gross_salary`. |
| remitted | BOOLEAN | Binary. Employer either remits to GRA by the 15th or does not. No pending state. |

---

### Table 12: penalties

Penalty records generated when a user misses a tax filing or payment deadline. Updated nightly by the Spring scheduled penalty engine.

> **Note:** GRA penalty rates hardcoded in the engine: income tax late filing: GHS 200 base + GHS 20/day. Late payment: 10% of tax due + 2% monthly interest. PAYE late remittance: 10% + interest.

```sql
CREATE TABLE penalties (
    penalty_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    return_id       UUID REFERENCES tax_returns(return_id),
    tax_type        VARCHAR(20) NOT NULL
                    CHECK (tax_type IN (
                      'income_tax', 'vat', 'paye', 'withholding')),
    deadline_date   DATE NOT NULL,
    filing_date     DATE,
    days_late       INTEGER DEFAULT 0,
    base_penalty    NUMERIC(15, 2) NOT NULL DEFAULT 0,
    daily_penalty   NUMERIC(15, 2) NOT NULL DEFAULT 0,
    total_penalty   NUMERIC(15, 2) NOT NULL DEFAULT 0,
    interest_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    resolved        BOOLEAN DEFAULT FALSE,
    resolved_at     TIMESTAMP,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);
```

---

### Table 13: tax_deadlines

Personalized tax deadline calendar per user. Pre-computed at onboarding and at the start of each tax year. Powers the deadline reminder notification system.

```sql
CREATE TABLE tax_deadlines (
    deadline_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    tax_type      VARCHAR(20) NOT NULL
                  CHECK (tax_type IN (
                    'income_tax', 'vat', 'paye', 'withholding')),
    deadline_date DATE NOT NULL,
    period_start  DATE NOT NULL,
    period_end    DATE NOT NULL,
    description   VARCHAR(255),
    reminder_sent BOOLEAN DEFAULT FALSE,
    completed     BOOLEAN DEFAULT FALSE,
    completed_at  TIMESTAMP,
    created_at    TIMESTAMP DEFAULT NOW(),
    UNIQUE (user_id, tax_type, period_start, period_end)
);
```

| Column | Type | Notes |
|---|---|---|
| deadline_date | DATE NOT NULL | Pre-computed to the exact last working day of the relevant month. Accounts for weekends and public holidays. |
| reminder_sent | BOOLEAN | Prevents the nightly reminder job from sending duplicate notifications. Flipped to true after first reminder. |
| completed | BOOLEAN | Flipped to true when user files and pays for the period. Removes deadline from active view. |

---

## Domain 4 — Payments and Vault

### Table 14: payments

Records every tax payment initiated through the app. Linked to either a tax return or a penalty record. Status tracks the payment through the MoMo confirmation lifecycle.

```sql
CREATE TABLE payments (
    payment_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    return_id         UUID REFERENCES tax_returns(return_id),
    penalty_id        UUID REFERENCES penalties(penalty_id),
    amount            NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    payment_method    VARCHAR(20) NOT NULL
                      CHECK (payment_method IN (
                        'momo', 'bank_card', 'ussd', 'vault')),
    payment_reference VARCHAR(150),
    status            VARCHAR(20) NOT NULL DEFAULT 'pending'
                      CHECK (status IN (
                        'pending', 'successful', 'failed')),
    paid_at           TIMESTAMP,
    created_at        TIMESTAMP DEFAULT NOW()
);
```

| Column | Type | Notes |
|---|---|---|
| return_id | UUID FK | Nullable. Links payment to a specific filed return. Null for penalty-only payments. |
| penalty_id | UUID FK | Nullable. Links payment to a specific penalty. One of `return_id` or `penalty_id` should be populated. |
| payment_method | VARCHAR CHECK | `vault` means payment was made directly from the Tax Savings Vault balance. |
| payment_reference | VARCHAR | Transaction reference from MTN MoMo or bank. Populated on successful confirmation. Printed on compliance certificate. |
| status | VARCHAR CHECK | `pending` during MoMo processing window. `successful` or `failed` on confirmation callback. |
| paid_at | TIMESTAMP | Null until payment confirmed successful. Records exact confirmation time. |

---

### Table 15: compliance_certificates

Immutable digital certificates issued after confirmed filing and payment. Legal documents — never updated after issuance.

```sql
CREATE TABLE compliance_certificates (
    certificate_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    payment_id      UUID NOT NULL UNIQUE REFERENCES payments(payment_id),
    return_id       UUID NOT NULL REFERENCES tax_returns(return_id),
    tax_type        VARCHAR(20) NOT NULL,
    period_start    DATE NOT NULL,
    period_end      DATE NOT NULL,
    amount_paid     NUMERIC(15, 2) NOT NULL,
    document_ref    VARCHAR(100) NOT NULL UNIQUE,
    issued_at       TIMESTAMP DEFAULT NOW()
);
```

| Column | Type | Notes |
|---|---|---|
| payment_id | UUID UNIQUE FK | One payment produces exactly one certificate. UNIQUE enforces this. |
| document_ref | VARCHAR UNIQUE NOT NULL | Human-readable reference e.g. `TXPD-2024-00847`. Printed on certificate and quoted to banks or auditors. |
| amount_paid | NUMERIC(15,2) | Copied from payment at issuance. Frozen independently of any future payment record changes. |
| issued_at | TIMESTAMP | No `updated_at` column. Certificates are immutable by design after issuance. |

---

### Table 16: savings_vault

One vault per user. Tracks current balance and MoMo link details.

> **Note:** TaxPadi does not hold user funds and does not require a banking license. The vault balance is a mirror of amounts held by the licensed microfinance partner. The `linked_momo_number` is the channel for initiating transfers to and from that partner wallet.

```sql
CREATE TABLE savings_vault (
    vault_id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id               UUID NOT NULL UNIQUE
                          REFERENCES users(user_id) ON DELETE CASCADE,
    balance               NUMERIC(15, 2) NOT NULL DEFAULT 0
                          CHECK (balance >= 0),
    linked_momo_number    VARCHAR(20),
    linked_momo_provider  VARCHAR(20)
                          CHECK (linked_momo_provider IN (
                            'mtn', 'telecel', 'airteltigo')),
    total_contributed     NUMERIC(15, 2) NOT NULL DEFAULT 0,
    total_withdrawn       NUMERIC(15, 2) NOT NULL DEFAULT 0,
    created_at            TIMESTAMP DEFAULT NOW(),
    updated_at            TIMESTAMP DEFAULT NOW()
);
```

---

### Table 17: vault_transactions

Itemized record of every credit and debit to the savings vault. The complete contribution history used by the financial referrals engine as a signal of financial discipline.

```sql
CREATE TABLE vault_transactions (
    vault_transaction_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vault_id              UUID NOT NULL
                          REFERENCES savings_vault(vault_id) ON DELETE CASCADE,
    user_id               UUID NOT NULL
                          REFERENCES users(user_id) ON DELETE CASCADE,
    type                  VARCHAR(10) NOT NULL
                          CHECK (type IN ('credit', 'debit')),
    amount                NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    trigger               VARCHAR(20) NOT NULL
                          CHECK (trigger IN (
                            'manual', 'suggested', 'tax_payment')),
    momo_reference        VARCHAR(150),
    status                VARCHAR(20) NOT NULL DEFAULT 'pending'
                          CHECK (status IN (
                            'pending', 'successful', 'failed')),
    created_at            TIMESTAMP DEFAULT NOW(),
    confirmed_at          TIMESTAMP
);
```

| Column | Type | Notes |
|---|---|---|
| type | VARCHAR CHECK | `credit`: money into vault. `debit`: money out of vault. |
| trigger | VARCHAR CHECK | `manual`: user initiated. `suggested`: user responded to app prompt. `tax_payment`: debit to pay a tax bill. |
| momo_reference | VARCHAR | Null until MoMo confirms the transfer. Null permanently for failed transactions. |
| confirmed_at | TIMESTAMP | Separate from `created_at`. Records when money actually moved vs when transfer was initiated. |

---

## Domain 5 — Platform

### Table 18: audit_logs

Immutable append-only record of all significant system activity. Required for GRA audit compliance, security monitoring, and the 6-year data retention policy. Never updated or deleted within the retention window.

```sql
CREATE TABLE audit_logs (
    log_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(user_id) ON DELETE SET NULL,
    action          VARCHAR(20) NOT NULL
                    CHECK (action IN (
                      'create', 'update', 'delete', 'login',
                      'logout', 'export', 'file', 'pay')),
    entity_type     VARCHAR(50) NOT NULL,
    entity_id       UUID,
    previous_value  JSONB,
    new_value       JSONB,
    ip_address      VARCHAR(45),
    device_info     VARCHAR(255),
    created_at      TIMESTAMP DEFAULT NOW()
);
```

| Column | Type | Notes |
|---|---|---|
| user_id | UUID ON DELETE SET NULL | SET NULL not CASCADE. Audit logs survive account deletion for legal compliance. |
| action | VARCHAR CHECK | Controlled vocabulary of all significant system actions. |
| entity_type | VARCHAR NOT NULL | The table name of the record affected e.g. `transactions`, `tax_returns`, `payments`. |
| previous_value | JSONB | Full JSON snapshot of the record before the change. Null for create actions. |
| new_value | JSONB | Full JSON snapshot of the record after the change. Null for delete actions. |
| ip_address | VARCHAR | IPv4 or IPv6. Used for security monitoring and fraud investigation. |

---

### Table 19: referral_offers

Pre-qualified loan and insurance offers generated weekly by the referrals engine for eligible users. Status tracks the conversion funnel from generation to confirmed partner handoff.

```sql
CREATE TABLE referral_offers (
    offer_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    offer_type    VARCHAR(20) NOT NULL
                  CHECK (offer_type IN ('loan', 'insurance')),
    partner_name  VARCHAR(100) NOT NULL,
    product_name  VARCHAR(150) NOT NULL,
    max_amount    NUMERIC(15, 2),
    interest_rate NUMERIC(5, 2),
    description   TEXT,
    deep_link     VARCHAR(500),
    status            VARCHAR(20) NOT NULL DEFAULT 'active'
                      CHECK (status IN (
                        'active', 'viewed', 'clicked', 'converted', 'expired', 'dismissed')),
    partner_reference VARCHAR(150),
    converted_at      TIMESTAMP,
    expires_at        TIMESTAMP,
    created_at        TIMESTAMP DEFAULT NOW(),
    updated_at        TIMESTAMP DEFAULT NOW()
);
```

| Column | Type | Notes |
|---|---|---|
| offer_type | VARCHAR CHECK | `loan` or `insurance`. Both use the same structure from TaxPadi's perspective. |
| deep_link | VARCHAR | Direct URL to the specific product page on the partner platform. More likely to convert than a homepage link. |
| status | VARCHAR CHECK | Five-stage funnel: `active` - `viewed` - `clicked` - `converted` - `expired`. Tracks revenue attribution and partner performance. |
| expires_at | TIMESTAMP | Partner offers have validity windows. Nightly job marks expired offers and triggers fresh generation for eligible users. |


---

### Table 20: taxbot_conversations

Stores the history of all TaxBot interactions per user. Allows users to retrieve past questions and answers without needing to re-ask. Append-only — conversations are never edited after creation.

```sql
CREATE TABLE taxbot_conversations (
    conversation_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    question         TEXT NOT NULL,
    answer           TEXT NOT NULL,
    created_at       TIMESTAMP DEFAULT NOW()
);
```

| Column | Type | Notes |
|---|---|---|
| question | TEXT NOT NULL | The full question the user submitted to TaxBot. |
| answer | TEXT NOT NULL | The full response returned by the Anthropic Claude API. |
| created_at | TIMESTAMP | No `updated_at` column. Conversations are immutable after creation. |

> **Note:** This table has no updated_at column by design. A TaxBot conversation is a historical record of what was asked and answered at a specific moment. It is never edited.

---

## Domain 6 — Subscriptions and Configuration

### Table 21: subscriptions

Tracks paid subscription history, plan type, payment references, and expiry for each user.

```sql
CREATE TABLE subscriptions (
    subscription_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    plan              VARCHAR(20) NOT NULL CHECK (plan IN ('monthly', 'annual')),
    status            VARCHAR(20) NOT NULL DEFAULT 'active'
                      CHECK (status IN ('active', 'cancelled', 'expired')),
    amount            NUMERIC(15, 2) NOT NULL,
    payment_reference VARCHAR(150),
    auto_renew        BOOLEAN DEFAULT TRUE,
    started_at        TIMESTAMP DEFAULT NOW(),
    expires_at        TIMESTAMP NOT NULL,
    cancelled_at      TIMESTAMP,
    created_at        TIMESTAMP DEFAULT NOW(),
    updated_at        TIMESTAMP DEFAULT NOW()
);
```

| Column | Type | Notes |
|---|---|---|
| plan | VARCHAR CHECK | `monthly` renews every 30 days. `annual` renews every 365 days. |
| status | VARCHAR CHECK | `active`: subscription is current. `cancelled`: user cancelled, access until expires_at. `expired`: period ended, downgraded to free. |
| auto_renew | BOOLEAN | Set to false on cancellation. Nightly job downgrades expired subscriptions. |
| payment_reference | VARCHAR | MoMo or bank reference from the subscription payment. |

---

### Table 22: import_history

Tracks every MoMo or bank statement import to prevent duplicate imports and power the import history screen.

```sql
CREATE TABLE import_history (
    import_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    provider       VARCHAR(30) NOT NULL,
    statement_from DATE NOT NULL,
    statement_to   DATE NOT NULL,
    total_imported INTEGER NOT NULL DEFAULT 0,
    total_skipped  INTEGER NOT NULL DEFAULT 0,
    imported_at    TIMESTAMP DEFAULT NOW()
);
```

| Column | Type | Notes |
|---|---|---|
| provider | VARCHAR NOT NULL | One of: mtn_momo, telecel_cash, gcb, absa, ecobank, fidelity, other. |
| statement_from / statement_to | DATE NOT NULL | The date range of the imported statement. Used for overlap detection. |
| total_imported | INTEGER | Number of transactions successfully created from the import. |
| total_skipped | INTEGER | Number of duplicate transactions detected and skipped. |

---

### Table 23: device_tokens

Stores biometric login tokens (SHA-256 hashed) per device per user.

```sql
CREATE TABLE device_tokens (
    token_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    token_hash   VARCHAR(64) NOT NULL UNIQUE,
    device_info  VARCHAR(255),
    is_active    BOOLEAN NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);
```

| Column | Type | Notes |
|---|---|---|
| token_hash | VARCHAR(64) NOT NULL UNIQUE | SHA-256 hash of the biometric token generated on-device. Raw token never stored. |
| device_info | VARCHAR | Human-readable device identifier (e.g. "iPhone 15, iOS 17"). Stored for audit/display. |
| is_active | BOOLEAN | Set to false on logout. Inactive tokens are skipped by the notification engine. |

---

### Table 24: notifications

Stores in-app notification records for each user.

```sql
CREATE TABLE notifications (
    notification_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title            VARCHAR(150) NOT NULL,
    body             TEXT NOT NULL,
    type             VARCHAR(20) NOT NULL
                     CHECK (type IN (
                       'deadline', 'penalty', 'vault',
                       'referral', 'payment', 'system')),
    read             BOOLEAN DEFAULT FALSE,
    action_url       VARCHAR(500),
    created_at       TIMESTAMP DEFAULT NOW()
);
```

| Column | Type | Notes |
|---|---|---|
| type | VARCHAR CHECK | Used by frontend to display the correct icon and color per notification type. |
| action_url | VARCHAR | Deep link within the app the user is taken to when tapping the notification. Nullable for informational notifications. |
| read | BOOLEAN | No `updated_at` — read status is the only mutable field and is tracked implicitly by `read`. |

---

### Table 25: partners

Stores referral partner configuration including eligibility thresholds and API key hashes for webhook authentication.

```sql
CREATE TABLE partners (
    partner_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                   VARCHAR(100) NOT NULL UNIQUE,
    offer_type             VARCHAR(20) NOT NULL
                           CHECK (offer_type IN ('loan', 'insurance')),
    api_key_hash           VARCHAR(255) NOT NULL UNIQUE,
    eligibility_threshold  JSONB NOT NULL,
    is_active              BOOLEAN DEFAULT TRUE,
    created_at             TIMESTAMP DEFAULT NOW(),
    updated_at             TIMESTAMP DEFAULT NOW()
);
```

| Column | Type | Notes |
|---|---|---|
| api_key_hash | VARCHAR UNIQUE NOT NULL | BCrypt hash of the partner API key. Raw key shown only once at creation and never stored. |
| eligibility_threshold | JSONB NOT NULL | Stores min_months_data, min_average_income, min_consistency_score, requires_tax_compliance per partner. |
| offer_type | VARCHAR CHECK | `loan` or `insurance`. A partner offers one type only. |

---

### Table 26: tax_rate_configs

Stores versioned history of all Ghana tax rate configurations. Updated annually after the national budget.

```sql
CREATE TABLE tax_rate_configs (
    config_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tax_year    INTEGER NOT NULL UNIQUE,
    config      JSONB NOT NULL,
    updated_by  UUID REFERENCES users(user_id) ON DELETE SET NULL,
    created_at  TIMESTAMP DEFAULT NOW()
);
```

| Column | Type | Notes |
|---|---|---|
| tax_year | INTEGER UNIQUE NOT NULL | One config record per tax year. UNIQUE prevents duplicates. |
| config | JSONB NOT NULL | Full rate configuration: brackets, VAT rates, withholding rates, penalty rates, all thresholds. |
| updated_by | UUID ON DELETE SET NULL | Admin user who last updated the rates. SET NULL if that admin account is deleted. |

> **Note:** The active tax rates are read from the `config` column of the record where `tax_year` matches the current tax year. The application falls back to the most recent year if no record exists for the current year.


---

## Entity Relationship Summary

All foreign key relationships across the 26 tables:

| Table | References | On Delete |
|---|---|---|
| user_tax_profiles | users(user_id) | CASCADE |
| otp_verifications | users(user_id) | CASCADE |
| refresh_tokens | users(user_id) | CASCADE |
| transactions | users(user_id) | CASCADE |
| invoices | users(user_id) | CASCADE |
| invoices | transactions(transaction_id) | SET NULL |
| tax_calculations | users(user_id) | CASCADE |
| tax_returns | users(user_id) | CASCADE |
| tax_returns | tax_calculations(calculation_id) | SET NULL |
| vat_records | users(user_id) | CASCADE |
| employees | users(user_id) | CASCADE |
| paye_records | employees(employee_id) | CASCADE |
| paye_records | users(user_id) | CASCADE |
| penalties | users(user_id) | CASCADE |
| penalties | tax_returns(return_id) | SET NULL |
| tax_deadlines | users(user_id) | CASCADE |
| payments | users(user_id) | CASCADE |
| payments | tax_returns(return_id) | SET NULL |
| payments | penalties(penalty_id) | SET NULL |
| compliance_certificates | users(user_id) | CASCADE |
| compliance_certificates | payments(payment_id) | RESTRICT |
| compliance_certificates | tax_returns(return_id) | RESTRICT |
| savings_vault | users(user_id) | CASCADE |
| vault_transactions | savings_vault(vault_id) | CASCADE |
| vault_transactions | users(user_id) | CASCADE |
| audit_logs | users(user_id) | SET NULL |
| referral_offers | users(user_id) | CASCADE |
| taxbot_conversations | users(user_id) | CASCADE |
| subscriptions | users(user_id) | CASCADE |
| import_history | users(user_id) | CASCADE |
| device_tokens | users(user_id) | CASCADE |
| notifications | users(user_id) | CASCADE |
| partners | — | No FK to users — platform-level table |
| tax_rate_configs | users(user_id) via updated_by | SET NULL |

> **Note:** SET NULL is used where the child record must survive the parent deletion for audit or legal purposes. RESTRICT on `compliance_certificates` prevents deletion of payments or returns that have issued certificates.

---

## Recommended Indexes

Primary keys are automatically indexed by PostgreSQL. The following additional indexes are recommended for the most frequently queried columns:

```sql
-- transactions: most common query patterns
CREATE INDEX idx_transactions_user_date
    ON transactions(user_id, transaction_date DESC);

CREATE INDEX idx_transactions_user_type
    ON transactions(user_id, type);

-- tax_calculations: dashboard live meter
CREATE INDEX idx_tax_calc_user_type
    ON tax_calculations(user_id, tax_type);

-- tax_returns: filing status queries
CREATE INDEX idx_tax_returns_user_status
    ON tax_returns(user_id, status);

-- penalties: nightly job and dashboard
CREATE INDEX idx_penalties_user_resolved
    ON penalties(user_id, resolved);

-- tax_deadlines: reminder job
CREATE INDEX idx_deadlines_date_reminder
    ON tax_deadlines(deadline_date, reminder_sent);

-- audit_logs: user history queries
CREATE INDEX idx_audit_logs_user_created
    ON audit_logs(user_id, created_at DESC);

-- refresh_tokens: login validation
CREATE INDEX idx_refresh_tokens_user_revoked
    ON refresh_tokens(user_id, revoked);

-- paye_records: monthly employer queries
CREATE INDEX idx_paye_user_year_month
    ON paye_records(user_id, year, month);

-- taxbot_conversations: history queries
CREATE INDEX idx_taxbot_user_created
    ON taxbot_conversations(user_id, created_at DESC);

-- import_history: overlap detection
CREATE INDEX idx_import_history_user_dates
    ON import_history(user_id, statement_from, statement_to);

-- device_tokens: notification dispatch
CREATE INDEX idx_device_tokens_user_active
    ON device_tokens(user_id, is_active);

-- notifications: unread count and list
CREATE INDEX idx_notifications_user_read
    ON notifications(user_id, read, created_at DESC);

-- subscriptions: status queries
CREATE INDEX idx_subscriptions_user_status
    ON subscriptions(user_id, status);

-- vat_records: monthly VAT queries
CREATE INDEX idx_vat_user_year_month
    ON vat_records(user_id, year, month);
```

---

## Scope and Future Tables

This schema covers Version 1.0 of TaxPadi as defined in the Codequest Project Proposal. The following tables are not included in Version 1.0 but will be required when the corresponding future enhancements are built:

| Future Enhancement | Tables Required |
|---|---|
| Accountant Marketplace | accountants, client_access_permissions, accountant_engagements |
| Corporate Tax Tier | companies, company_members, corporate_tax_profiles |
| Cash Flow Forecasting | cash_flow_projections |
| Peer Benchmarking | benchmark_aggregates |
| Anonymized Data Product | sme_data_reports |
| Direct GRA API Integration | gra_submission_logs |

> **Note:** None of these future tables require modifications to the existing 26 tables. The Version 1.0 schema is designed to be extended without breaking changes.

**Version History:**

| Version | Date | Change |
|---|---|---|
| 1.0 | April 2026 | Initial schema — 20 tables |
| 1.1 | April 2026 | Added 6 tables and column additions identified during API contract design |

---

*TaxPadi — Database Schema Documentation v1.1 | Group 104 | KNUST Department of Computer Science | April 2026*
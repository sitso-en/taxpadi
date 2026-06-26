CREATE TABLE IF NOT EXISTS tax_profiles (
    profile_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    label        VARCHAR(100) NOT NULL,
    taxpayer_category VARCHAR(30) NOT NULL,
    tin          VARCHAR(20),
    is_primary   BOOLEAN NOT NULL DEFAULT FALSE,
    tax_year_start DATE,
    created_at   TIMESTAMP NOT NULL,
    updated_at   TIMESTAMP NOT NULL
);

-- Login brute-force protection
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS failed_login_attempts INT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP;

-- OTP attempt limiting
ALTER TABLE otp_verifications
    ADD COLUMN IF NOT EXISTS attempt_count INT NOT NULL DEFAULT 0;
    
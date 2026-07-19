-- V8: Add missing partial unique indexes to prevent duplicate active records
--
-- otp_verifications: only one unused OTP per (user, purpose) at a time
-- device_tokens:     only one active biometric token per (user, device_info)
-- subscriptions:     only one active subscription per user

-- Step 1: Clean up any existing duplicate unused OTPs (keep newest per user+purpose)
WITH ranked AS (
    SELECT otp_id,
           ROW_NUMBER() OVER (
               PARTITION BY user_id, purpose
               ORDER BY created_at DESC
           ) AS rn
    FROM otp_verifications
    WHERE used = false
)
UPDATE otp_verifications
SET used = true
WHERE otp_id IN (SELECT otp_id FROM ranked WHERE rn > 1);

-- Enforce: at most one unused OTP per (user_id, purpose)
CREATE UNIQUE INDEX IF NOT EXISTS uq_otp_user_purpose_active
    ON otp_verifications (user_id, purpose)
    WHERE used = false;

-- Step 2: Clean up duplicate active device tokens (keep newest per user+device_info)
WITH ranked AS (
    SELECT token_id,
           ROW_NUMBER() OVER (
               PARTITION BY user_id, device_info
               ORDER BY created_at DESC
           ) AS rn
    FROM device_tokens
    WHERE is_active = true
      AND device_info IS NOT NULL
)
UPDATE device_tokens
SET is_active = false
WHERE token_id IN (SELECT token_id FROM ranked WHERE rn > 1);

-- Enforce: at most one active token per (user_id, device_info)
CREATE UNIQUE INDEX IF NOT EXISTS uq_device_tokens_user_device_active
    ON device_tokens (user_id, device_info)
    WHERE is_active = true AND device_info IS NOT NULL;

-- Step 3: Clean up duplicate active subscriptions (keep newest per user)
WITH ranked AS (
    SELECT subscription_id,
           ROW_NUMBER() OVER (
               PARTITION BY user_id
               ORDER BY created_at DESC
           ) AS rn
    FROM subscriptions
    WHERE status = 'ACTIVE'
)
UPDATE subscriptions
SET status = 'CANCELLED'
WHERE subscription_id IN (SELECT subscription_id FROM ranked WHERE rn > 1);

-- Enforce: at most one active subscription per user
CREATE UNIQUE INDEX IF NOT EXISTS uq_subscriptions_user_active
    ON subscriptions (user_id)
    WHERE status = 'ACTIVE';

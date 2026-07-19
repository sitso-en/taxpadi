-- V7: Fix duplicate non-revoked refresh token rows and add schema safeguard
--
-- Root cause: JPQL "WHERE device_info = :deviceInfo" when deviceInfo is null
-- compiles to SQL "WHERE device_info = NULL" which is always false, causing
-- every null-deviceInfo login to INSERT a new row instead of reusing the existing one.
-- This migration cleans up the accumulated bad data and adds a partial unique index
-- to prevent it at the database level going forward.

-- Step 1: Revoke all duplicate non-revoked tokens, keeping only the newest per
-- (user_id, device_info) partition. NULL device_info values are grouped together
-- per user by PostgreSQL window functions (unlike WHERE-clause null comparisons).
WITH ranked AS (
    SELECT token_id,
           ROW_NUMBER() OVER (
               PARTITION BY user_id, device_info
               ORDER BY created_at DESC
           ) AS rn
    FROM refresh_tokens
    WHERE revoked = false
)
UPDATE refresh_tokens
SET    revoked    = true,
       revoked_at = NOW()
WHERE  token_id IN (SELECT token_id FROM ranked WHERE rn > 1);

-- Step 2: Add a partial unique index so the database rejects any future attempt to
-- insert a second non-revoked row for the same (user_id, device_info) pair.
-- The WHERE clause excludes already-revoked rows (they can repeat freely).
-- NULL device_info is excluded because SQL treats each NULL as distinct, so a
-- unique index on NULLs would not enforce the constraint; the application code
-- handles null-device deduplication via the explicit revoke-before-insert pattern.
CREATE UNIQUE INDEX IF NOT EXISTS uq_refresh_tokens_user_device_active
    ON refresh_tokens (user_id, device_info)
    WHERE revoked = false AND device_info IS NOT NULL;

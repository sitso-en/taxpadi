-- Fix vault transactions that were created with PENDING status but had
-- their balance applied immediately (balance_after is not null).
-- These are deposits that were treated as successful by the balance engine
-- but never had their status updated to SUCCESSFUL.
UPDATE vault_transactions
SET status = 'SUCCESSFUL',
    confirmed_at = COALESCE(confirmed_at, created_at)
WHERE type = 'DEPOSIT'
  AND status = 'PENDING'
  AND balance_after IS NOT NULL;

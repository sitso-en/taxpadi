-- Performance: add indexes on high-frequency lookup columns
CREATE INDEX IF NOT EXISTS idx_transactions_user_created ON transactions(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_at ON subscriptions(expires_at);
CREATE INDEX IF NOT EXISTS idx_penalties_due_date ON penalties(due_date);
CREATE INDEX IF NOT EXISTS idx_tax_deadlines_due_date ON tax_deadlines(due_date);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_paye_records_employee ON paye_records(employee_id, month, year);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

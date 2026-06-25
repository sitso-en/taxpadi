-- ============================================================
-- TaxPadi — Partner & Referral Offer Seed Data
-- Run against: taxpadi_db
-- ============================================================

-- ── PARTNERS ─────────────────────────────────────────────────

INSERT INTO partners (partner_id, name, offer_type, api_key_hash, eligibility_threshold, is_active, total_offers_generated, total_converted, created_at)
VALUES
  -- Loan partners
  (gen_random_uuid(), 'Fido Ghana', 'LOAN',
   '$2a$10$dummyhashFidoGhana000000000000000000000000000000000000',
   '{"min_health_score": 60, "min_monthly_income": 500}',
   true, 0, 0, NOW()),

  (gen_random_uuid(), 'CalBank Ghana', 'LOAN',
   '$2a$10$dummyhashCalBankGhana00000000000000000000000000000000',
   '{"min_health_score": 65, "min_monthly_income": 1500, "min_tin_age_months": 6}',
   true, 0, 0, NOW()),

  (gen_random_uuid(), 'Letshego Ghana', 'LOAN',
   '$2a$10$dummyhashLetshego0000000000000000000000000000000000000',
   '{"min_health_score": 55, "min_monthly_income": 800}',
   true, 0, 0, NOW()),

  (gen_random_uuid(), 'Access Bank Ghana', 'LOAN',
   '$2a$10$dummyhashAccessBank00000000000000000000000000000000000',
   '{"min_health_score": 70, "min_monthly_income": 2000, "min_tin_age_months": 12}',
   true, 0, 0, NOW()),

  (gen_random_uuid(), 'Republic Bank Ghana', 'LOAN',
   '$2a$10$dummyhashRepublicBank000000000000000000000000000000000',
   '{"min_health_score": 65, "min_monthly_income": 1200}',
   true, 0, 0, NOW()),

  -- Insurance partners
  (gen_random_uuid(), 'Enterprise Insurance', 'INSURANCE',
   '$2a$10$dummyhashEnterprise00000000000000000000000000000000000',
   '{"min_health_score": 50}',
   true, 0, 0, NOW()),

  (gen_random_uuid(), 'SIC Insurance Ghana', 'INSURANCE',
   '$2a$10$dummyhashSICInsurance0000000000000000000000000000000000',
   '{"min_health_score": 50}',
   true, 0, 0, NOW()),

  (gen_random_uuid(), 'Jubilee Life Insurance', 'INSURANCE',
   '$2a$10$dummyhashJubileeLife000000000000000000000000000000000',
   '{"min_health_score": 55}',
   true, 0, 0, NOW()),

  (gen_random_uuid(), 'GLICO Life', 'INSURANCE',
   '$2a$10$dummyhashGLICOLife00000000000000000000000000000000000',
   '{"min_health_score": 50}',
   true, 0, 0, NOW()),

  (gen_random_uuid(), 'Star Assurance', 'INSURANCE',
   '$2a$10$dummyhashStarAssurance000000000000000000000000000000',
   '{"min_health_score": 50}',
   true, 0, 0, NOW());


-- ── REFERRAL OFFERS (for the first existing user) ────────────
-- Replace the subquery if you want to target a specific user

WITH target_user AS (
  SELECT user_id FROM users ORDER BY created_at ASC LIMIT 1
)

INSERT INTO referral_offers (
  offer_id, user_id, offer_type, partner_name, product_name,
  max_amount, interest_rate, description, deep_link,
  partner_reference, status, expires_at, created_at, updated_at
)
SELECT
  gen_random_uuid(), u.user_id, offer_type::varchar, partner_name, product_name,
  max_amount, interest_rate, description, deep_link,
  partner_reference, 'ACTIVE', NOW() + INTERVAL '30 days', NOW(), NOW()
FROM target_user u,
(VALUES
  ('LOAN', 'Fido Ghana', 'Fido Instant Loan',
   5000.00, 7.50,
   'Get instant cash in minutes. No collateral needed. Repay in 3–12 months.',
   'https://fido.com.gh/apply', 'FIDO-TXPD-001'),

  ('LOAN', 'CalBank Ghana', 'CalBank SME Business Loan',
   50000.00, 24.00,
   'Grow your business with flexible SME financing. Repayment up to 36 months.',
   'https://calbank.net/sme-loans', 'CALBANK-TXPD-001'),

  ('LOAN', 'Letshego Ghana', 'Letshego Personal Loan',
   20000.00, 30.00,
   'Unsecured personal loan for salaried workers and sole traders.',
   'https://letshego.com/gh/personal', 'LETSHEGO-TXPD-001'),

  ('LOAN', 'Access Bank Ghana', 'Access Bank PayDay Loan',
   10000.00, 18.00,
   'Short-term bridge financing for tax payments and cash flow gaps.',
   'https://accessbankghana.com/payday-loan', 'ACCESS-TXPD-001'),

  ('LOAN', 'Republic Bank Ghana', 'Republic Bank Trader Loan',
   30000.00, 22.00,
   'Working capital for traders and small business owners. Quick disbursement.',
   'https://republicbank.com.gh/trader-loan', 'REPUBLIC-TXPD-001'),

  ('INSURANCE', 'Enterprise Insurance', 'Enterprise Business Shield',
   NULL, NULL,
   'Comprehensive business insurance covering assets, liability, and revenue loss.',
   'https://enterprisegroup.com.gh/insurance', 'ENTERPRISE-TXPD-001'),

  ('INSURANCE', 'SIC Insurance Ghana', 'SIC SME Package',
   NULL, NULL,
   'Tailored insurance package for sole traders and SMEs. Fire, theft, and liability cover.',
   'https://sicghana.com/sme', 'SIC-TXPD-001'),

  ('INSURANCE', 'Jubilee Life Insurance', 'Jubilee Tax Protection Plan',
   NULL, NULL,
   'Life and income protection insurance designed for self-employed professionals.',
   'https://jubileeinsurance.com/gh/tax-plan', 'JUBILEE-TXPD-001'),

  ('INSURANCE', 'GLICO Life', 'GLICO Pension Plus',
   NULL, NULL,
   'Voluntary pension and retirement savings for sole traders and business owners.',
   'https://glico.com.gh/pension-plus', 'GLICO-TXPD-001'),

  ('INSURANCE', 'Star Assurance', 'Star Business Protect',
   NULL, NULL,
   'Business interruption and professional indemnity cover for consultants and traders.',
   'https://starassurance.com.gh/business', 'STAR-TXPD-001')
) AS offers(offer_type, partner_name, product_name, max_amount, interest_rate, description, deep_link, partner_reference);

-- TaxPadi Partner & Referral Offers Seed
-- Run this once against the production/staging DB after V1 migration
-- Referral offers are seeded for the first registered user

-- ============================================================
-- PARTNERS (10 Loan + 10 Insurance)
-- ============================================================

INSERT INTO partners (partner_id, name, offer_type, api_key_hash, eligibility_threshold, is_active, total_offers_generated, total_converted, created_at) VALUES

-- Loan Partners
('a1000000-0000-0000-0000-000000000001', 'Fidelity Bank Ghana',          'LOAN',      'seed-hash-fidelity-loan',      '{"min_income": 1000, "min_tax_compliance_score": 40}', TRUE, 0, 0, NOW()),
('a1000000-0000-0000-0000-000000000002', 'Absa Bank Ghana',              'LOAN',      'seed-hash-absa-loan',          '{"min_income": 2000, "min_tax_compliance_score": 55}', TRUE, 0, 0, NOW()),
('a1000000-0000-0000-0000-000000000003', 'Stanbic Bank Ghana',           'LOAN',      'seed-hash-stanbic-loan',       '{"min_income": 3000, "min_tax_compliance_score": 50}', TRUE, 0, 0, NOW()),
('a1000000-0000-0000-0000-000000000004', 'GCB Bank Ghana',               'LOAN',      'seed-hash-gcb-loan',           '{"min_income": 1500, "min_tax_compliance_score": 45}', TRUE, 0, 0, NOW()),
('a1000000-0000-0000-0000-000000000005', 'Access Bank Ghana',            'LOAN',      'seed-hash-access-loan',        '{"min_income": 2000, "min_tax_compliance_score": 40}', TRUE, 0, 0, NOW()),
('a1000000-0000-0000-0000-000000000006', 'CalBank Ghana',                'LOAN',      'seed-hash-calbank-loan',       '{"min_income": 1500, "min_tax_compliance_score": 60}', TRUE, 0, 0, NOW()),
('a1000000-0000-0000-0000-000000000007', 'Republic Bank Ghana',          'LOAN',      'seed-hash-republic-loan',      '{"min_income": 2500, "min_tax_compliance_score": 35}', TRUE, 0, 0, NOW()),
('a1000000-0000-0000-0000-000000000008', 'Ecobank Ghana',                'LOAN',      'seed-hash-ecobank-loan',       '{"min_income": 2000, "min_tax_compliance_score": 60}', TRUE, 0, 0, NOW()),
('a1000000-0000-0000-0000-000000000009', 'First National Bank Ghana',    'LOAN',      'seed-hash-fnb-loan',           '{"min_income": 3000, "min_tax_compliance_score": 35}', TRUE, 0, 0, NOW()),
('a1000000-0000-0000-0000-000000000010', 'Agricultural Development Bank','LOAN',      'seed-hash-adb-loan',           '{"min_income": 1000, "min_tax_compliance_score": 30}', TRUE, 0, 0, NOW()),

-- Insurance Partners
('b1000000-0000-0000-0000-000000000001', 'Enterprise Life Assurance',    'INSURANCE', 'seed-hash-enterprise-ins',     '{"min_income": 500,  "min_tax_compliance_score": 30}', TRUE, 0, 0, NOW()),
('b1000000-0000-0000-0000-000000000002', 'Star Assurance Ghana',         'INSURANCE', 'seed-hash-star-ins',           '{"min_income": 500,  "min_tax_compliance_score": 40}', TRUE, 0, 0, NOW()),
('b1000000-0000-0000-0000-000000000003', 'SIC Insurance Ghana',          'INSURANCE', 'seed-hash-sic-ins',            '{"min_income": 500,  "min_tax_compliance_score": 50}', TRUE, 0, 0, NOW()),
('b1000000-0000-0000-0000-000000000004', 'Hollard Insurance Ghana',      'INSURANCE', 'seed-hash-hollard-ins',        '{"min_income": 800,  "min_tax_compliance_score": 55}', TRUE, 0, 0, NOW()),
('b1000000-0000-0000-0000-000000000005', 'Vanguard Assurance Ghana',     'INSURANCE', 'seed-hash-vanguard-ins',       '{"min_income": 600,  "min_tax_compliance_score": 40}', TRUE, 0, 0, NOW()),
('b1000000-0000-0000-0000-000000000006', 'Phoenix Insurance Ghana',      'INSURANCE', 'seed-hash-phoenix-ins',        '{"min_income": 600,  "min_tax_compliance_score": 50}', TRUE, 0, 0, NOW()),
('b1000000-0000-0000-0000-000000000007', 'GLICO Life Insurance',         'INSURANCE', 'seed-hash-glico-ins',          '{"min_income": 700,  "min_tax_compliance_score": 55}', TRUE, 0, 0, NOW()),
('b1000000-0000-0000-0000-000000000008', 'Provident Life Assurance',     'INSURANCE', 'seed-hash-provident-ins',      '{"min_income": 500,  "min_tax_compliance_score": 40}', TRUE, 0, 0, NOW()),
('b1000000-0000-0000-0000-000000000009', 'Donewell Life Insurance',      'INSURANCE', 'seed-hash-donewell-ins',       '{"min_income": 500,  "min_tax_compliance_score": 50}', TRUE, 0, 0, NOW()),
('b1000000-0000-0000-0000-000000000010', 'Metropolitan Insurance Ghana', 'INSURANCE', 'seed-hash-metropolitan-ins',   '{"min_income": 800,  "min_tax_compliance_score": 35}', TRUE, 0, 0, NOW());


-- ============================================================
-- REFERRAL OFFERS for first user
-- Replace the user_id below with the actual first user's UUID
-- ============================================================

DO $$
DECLARE
    v_user_id UUID := '110f59bb-2410-482f-ba8e-cdb990650584';
    v_expires  TIMESTAMP := NOW() + INTERVAL '90 days';
BEGIN

INSERT INTO referral_offers (offer_id, user_id, offer_type, partner_name, product_name, max_amount, interest_rate, description, deep_link, partner_reference, status, expires_at, created_at, updated_at) VALUES

-- Loan Offers
(gen_random_uuid(), v_user_id, 'LOAN', 'Fidelity Bank Ghana',          'SME Business Loan',          50000.00, 18.50, 'Quick SME loan for registered businesses. Funds disbursed within 5 working days.',          'https://fidelitybank.com.gh/sme-loan',      'FIDELITY-SME-001',   'ACTIVE', v_expires, NOW(), NOW()),
(gen_random_uuid(), v_user_id, 'LOAN', 'Absa Bank Ghana',              'Personal Unsecured Loan',    30000.00, 20.00, 'Personal loan with no collateral required. Repay over 12–48 months.',                    'https://absa.com.gh/personal-loan',         'ABSA-PERS-001',      'ACTIVE', v_expires, NOW(), NOW()),
(gen_random_uuid(), v_user_id, 'LOAN', 'Stanbic Bank Ghana',           'Business Overdraft',         80000.00, 19.00, 'Flexible overdraft facility for business cash flow management.',                        'https://stanbicbank.com.gh/overdraft',      'STANBIC-OD-001',     'ACTIVE', v_expires, NOW(), NOW()),
(gen_random_uuid(), v_user_id, 'LOAN', 'GCB Bank Ghana',               'Trader Loan',                20000.00, 17.00, 'Short-term loan for traders and market women. Simple documentation required.',           'https://gcbbank.com.gh/trader-loan',        'GCB-TRADER-001',     'ACTIVE', v_expires, NOW(), NOW()),
(gen_random_uuid(), v_user_id, 'LOAN', 'Access Bank Ghana',            'PayDay Loan',                 5000.00, 22.00, 'Quick cash before payday. Apply in minutes, disbursed same day.',                       'https://accessbankghana.com/payday',        'ACCESS-PAY-001',     'ACTIVE', v_expires, NOW(), NOW()),
(gen_random_uuid(), v_user_id, 'LOAN', 'CalBank Ghana',                'Micro Business Loan',        15000.00, 19.50, 'Loan for micro and small businesses. Minimal collateral required.',                     'https://calbank.net/micro-business',        'CAL-MICRO-001',      'ACTIVE', v_expires, NOW(), NOW()),
(gen_random_uuid(), v_user_id, 'LOAN', 'Republic Bank Ghana',          'Home Improvement Loan',      40000.00, 18.00, 'Renovate or expand your home with our flexible home improvement loan.',                  'https://republicghana.com/home-loan',       'REPUBLIC-HOME-001',  'ACTIVE', v_expires, NOW(), NOW()),
(gen_random_uuid(), v_user_id, 'LOAN', 'Ecobank Ghana',                'Ecobank Xpress Loan',        10000.00, 21.00, 'Instant mobile loan. No paperwork, no branch visit required.',                          'https://ecobank.com/gh/xpress-loan',        'ECO-XPRESS-001',     'ACTIVE', v_expires, NOW(), NOW()),
(gen_random_uuid(), v_user_id, 'LOAN', 'First National Bank Ghana',    'Professional Loan',          60000.00, 17.50, 'Tailored for professionals — doctors, lawyers, engineers and accountants.',              'https://fnbghana.com/professional-loan',    'FNB-PROF-001',       'ACTIVE', v_expires, NOW(), NOW()),
(gen_random_uuid(), v_user_id, 'LOAN', 'Agricultural Development Bank','Agric Business Loan',        35000.00, 15.00, 'Low-interest loan for agric businesses and food value chain operators.',                 'https://adbghana.com/agric-loan',           'ADB-AGRIC-001',      'ACTIVE', v_expires, NOW(), NOW()),

-- Insurance Offers
(gen_random_uuid(), v_user_id, 'INSURANCE', 'Enterprise Life Assurance',    'Enterprise Life Term Plan',   NULL, NULL, 'Protect your family with life cover starting from GHS 50/month. Easy mobile signup.',    'https://enterpriselife.com.gh/term-plan',   'ENT-TERM-001',       'ACTIVE', v_expires, NOW(), NOW()),
(gen_random_uuid(), v_user_id, 'INSURANCE', 'Star Assurance Ghana',         'Star Business Shield',        NULL, NULL, 'Business insurance covering fire, theft, and public liability for SMEs.',               'https://starassurance.com.gh/business',     'STAR-BIZ-001',       'ACTIVE', v_expires, NOW(), NOW()),
(gen_random_uuid(), v_user_id, 'INSURANCE', 'SIC Insurance Ghana',          'SIC Motor Comprehensive',     NULL, NULL, 'Comprehensive motor insurance with roadside assistance. Renew online in minutes.',      'https://sicghana.com/motor',                'SIC-MOTOR-001',      'ACTIVE', v_expires, NOW(), NOW()),
(gen_random_uuid(), v_user_id, 'INSURANCE', 'Hollard Insurance Ghana',      'Hollard SME Package',         NULL, NULL, 'All-in-one SME insurance: property, liability, and equipment cover.',                   'https://hollard.com.gh/sme',                'HOL-SME-001',        'ACTIVE', v_expires, NOW(), NOW()),
(gen_random_uuid(), v_user_id, 'INSURANCE', 'Vanguard Assurance Ghana',     'Vanguard Health Plan',        NULL, NULL, 'Affordable health insurance for individuals and families. Cashless hospital access.',   'https://vanguardassurance.com/health',      'VAN-HEALTH-001',     'ACTIVE', v_expires, NOW(), NOW()),
(gen_random_uuid(), v_user_id, 'INSURANCE', 'Phoenix Insurance Ghana',      'Phoenix Property Insurance',  NULL, NULL, 'Protect your home and business property against fire, flood, and burglary.',            'https://phoenixinsurance.com.gh/property',  'PHX-PROP-001',       'ACTIVE', v_expires, NOW(), NOW()),
(gen_random_uuid(), v_user_id, 'INSURANCE', 'GLICO Life Insurance',         'GLICO Pension Plus',          NULL, NULL, 'Voluntary pension plan with life cover. Start saving for retirement from GHS 30/month.','https://glicolife.com/pension-plus',        'GLICO-PEN-001',      'ACTIVE', v_expires, NOW(), NOW()),
(gen_random_uuid(), v_user_id, 'INSURANCE', 'Provident Life Assurance',     'Provident Education Plan',    NULL, NULL, 'Save for your child''s education with built-in life cover. Flexible premiums.',         'https://providentlife.com.gh/education',    'PROV-EDU-001',       'ACTIVE', v_expires, NOW(), NOW()),
(gen_random_uuid(), v_user_id, 'INSURANCE', 'Donewell Life Insurance',      'Donewell Funeral Cover',      NULL, NULL, 'Comprehensive funeral cover for you and your extended family from GHS 20/month.',       'https://donewelllife.com/funeral',          'DON-FUN-001',        'ACTIVE', v_expires, NOW(), NOW()),
(gen_random_uuid(), v_user_id, 'INSURANCE', 'Metropolitan Insurance Ghana', 'Metro Critical Illness Cover', NULL, NULL, 'Lump sum payout on diagnosis of critical illness. Covers 30+ conditions.',            'https://metropolitan.com.gh/critical',      'MET-CRIT-001',       'ACTIVE', v_expires, NOW(), NOW());

END $$;

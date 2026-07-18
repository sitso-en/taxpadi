-- Seed Ghana 2025 GRA tax rates into tax_rate_configs.
-- Uses WHERE NOT EXISTS so it is safe even if TaxRateSeedRunner already inserted data.

INSERT INTO tax_rate_configs (
    config_id,
    tax_year,
    income_tax_brackets,
    vat_standard_rate,
    vat_nhil_levy,
    vat_getfund_levy,
    vat_covid_levy,
    vat_registration_threshold,
    withholding_rates,
    updated_at,
    created_at
)
SELECT
    gen_random_uuid(),
    2025,
    '[
      {"bracket": 1, "from": 0,      "to": 5880,   "rate": "0%",    "description": "First GHS 5,880 annually"},
      {"bracket": 2, "from": 5881,   "to": 7200,   "rate": "5%",    "description": "Next GHS 1,320"},
      {"bracket": 3, "from": 7201,   "to": 8760,   "rate": "10%",   "description": "Next GHS 1,560"},
      {"bracket": 4, "from": 8761,   "to": 46760,  "rate": "17.5%", "description": "Next GHS 38,000"},
      {"bracket": 5, "from": 46761,  "to": 238760, "rate": "25%",   "description": "Next GHS 192,000"},
      {"bracket": 6, "from": 238761, "to": 605000, "rate": "30%",   "description": "Next GHS 366,240"},
      {"bracket": 7, "from": 605001, "to": null,   "rate": "35%",   "description": "Exceeding GHS 605,000"}
    ]'::jsonb,
    15.00,
    2.50,
    2.50,
    0.00,
    750000.00,
    '[
      {"category": "Dividends",             "rate": "8%",    "description": "Paid to resident persons (final tax)"},
      {"category": "Interest",              "rate": "8%",    "description": "Paid to resident persons"},
      {"category": "Rent \u2013 Residential", "rate": "8%",    "description": "Investment property (final tax)"},
      {"category": "Rent \u2013 Commercial",  "rate": "15%",   "description": "Investment property (final tax)"},
      {"category": "Royalties",             "rate": "15%",   "description": "Royalties and natural resource payments"},
      {"category": "Supply of Goods",       "rate": "3%",    "description": "Payments exceeding GHS 2,000"},
      {"category": "Supply of Works",       "rate": "5%",    "description": "Payments exceeding GHS 2,000"},
      {"category": "Supply of Services",    "rate": "7.5%",  "description": "Payments to non-individuals exceeding GHS 2,000"},
      {"category": "Director / Board Fees", "rate": "20%",   "description": "Fees to resident directors and board members"}
    ]'::jsonb,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM tax_rate_configs);

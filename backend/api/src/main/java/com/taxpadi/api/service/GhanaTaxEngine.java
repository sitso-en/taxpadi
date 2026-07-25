package com.taxpadi.api.service;

import java.math.BigDecimal;
import java.math.RoundingMode;

import org.springframework.stereotype.Component;

@Component
public class GhanaTaxEngine {

    //Income Tax Annual Brackets
    private static final BigDecimal[][] INCOME_TAX_BRACKETS = {
        { bd("5880"),   bd("0.00")  },
        { bd("1320"),   bd("0.05")  },
        { bd("1560"),   bd("0.10")  },
        { bd("38000"),  bd("0.175") },
        { bd("192000"), bd("0.25")  },
        { bd("366240"), bd("0.30")  },
        { null,         bd("0.35")  }  
    };

    //PAYE Monthly Brackets (annual ÷ 12)
    private static final BigDecimal[][] PAYE_BRACKETS = {
        { bd("490"),    bd("0.00")  },
        { bd("110"),    bd("0.05")  },
        { bd("130"),    bd("0.10")  },
        { bd("3167"),   bd("0.175") },
        { bd("16000"),  bd("0.25")  },
        { bd("30520"),  bd("0.30")  },
        { null,         bd("0.35")  }
    };

    // VAT and health/education levies (Act 1151). Only the 15% VAT is recoverable
    // as input credit; NHIL (2.5%) and GETFund (2.5%) are levies charged on output
    // supplies and can NOT be offset by input VAT. Effective rate on output = 20%.
    private static final BigDecimal VAT_RATE     = bd("0.15");
    private static final BigDecimal NHIL_RATE    = bd("0.025");
    private static final BigDecimal GETFUND_RATE = bd("0.025");

    // Employee SSNIT contribution (Tier 1 + Tier 2), deductible from cash
    // emoluments before PAYE is applied.
    private static final BigDecimal SSNIT_EMPLOYEE_RATE = bd("0.055");

    //Withholding Tax Rates
    public static final BigDecimal WHT_DIVIDENDS         = bd("0.08");
    public static final BigDecimal WHT_INTEREST          = bd("0.08");
    public static final BigDecimal WHT_ROYALTIES         = bd("0.15");
    public static final BigDecimal WHT_RENT_RESIDENTIAL  = bd("0.08");
    public static final BigDecimal WHT_RENT_COMMERCIAL   = bd("0.15");
    public static final BigDecimal WHT_GOODS             = bd("0.03");
    public static final BigDecimal WHT_WORKS             = bd("0.05");
    public static final BigDecimal WHT_SERVICES          = bd("0.075");
    public static final BigDecimal WHT_DIRECTOR_FEES     = bd("0.20");

    /**
     * Calculate income tax liability using Ghana's graduated annual brackets.
     * Negative taxable income returns zero.
     */
    public BigDecimal calculateIncomeTax(BigDecimal taxableIncome) {
        return applyBrackets(taxableIncome, INCOME_TAX_BRACKETS);
    }

    /**
     * Calculate PAYE liability using monthly graduated brackets.
     */
    public BigDecimal calculatePaye(BigDecimal monthlyTaxableIncome) {
        return applyBrackets(monthlyTaxableIncome, PAYE_BRACKETS);
    }

    /**
     * Calculate the 15% VAT on a taxable supply value. This is the only component
     * that is recoverable as an input credit (output VAT less input VAT).
     */
    public BigDecimal calculateVat(BigDecimal taxableSupply) {
        return pct(taxableSupply, VAT_RATE);
    }

    /** Calculate the 2.5% NHIL levy on a taxable supply value (not recoverable). */
    public BigDecimal calculateNhil(BigDecimal taxableSupply) {
        return pct(taxableSupply, NHIL_RATE);
    }

    /** Calculate the 2.5% GETFund levy on a taxable supply value (not recoverable). */
    public BigDecimal calculateGetfund(BigDecimal taxableSupply) {
        return pct(taxableSupply, GETFUND_RATE);
    }

    /** Employee mandatory SSNIT contribution (5.5%), deductible before PAYE. */
    public BigDecimal calculateEmployeeSsnit(BigDecimal basicSalary) {
        return pct(basicSalary, SSNIT_EMPLOYEE_RATE);
    }

    /**
     * Calculate withholding tax for a given payment type and gross amount.
     * paymentType: dividends | interest | royalties | rent_residential |
     *              rent_commercial | goods | works | services | director_fees
     */
    public BigDecimal calculateWithholding(BigDecimal grossAmount, String paymentType) {
        BigDecimal rate = switch (paymentType.toLowerCase()) {
            case "dividends"        -> WHT_DIVIDENDS;
            case "interest"         -> WHT_INTEREST;
            case "royalties"        -> WHT_ROYALTIES;
            case "rent_residential" -> WHT_RENT_RESIDENTIAL;
            case "rent_commercial"  -> WHT_RENT_COMMERCIAL;
            case "goods"            -> WHT_GOODS;
            case "works"            -> WHT_WORKS;
            case "services"         -> WHT_SERVICES;
            case "director_fees"    -> WHT_DIRECTOR_FEES;
            default -> throw new IllegalArgumentException("Unknown WHT payment type: " + paymentType);
        };
        return grossAmount.multiply(rate).setScale(2, RoundingMode.HALF_UP);
    }

    //Private helpers

    /** Apply a flat rate to a base, returning zero for null/non-positive bases. */
    private BigDecimal pct(BigDecimal base, BigDecimal rate) {
        if (base == null || base.compareTo(BigDecimal.ZERO) <= 0) return BigDecimal.ZERO;
        return base.multiply(rate).setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal applyBrackets(BigDecimal income, BigDecimal[][] brackets) {
        if (income == null || income.compareTo(BigDecimal.ZERO) <= 0) return BigDecimal.ZERO;

        BigDecimal tax = BigDecimal.ZERO;
        BigDecimal remaining = income;

        for (BigDecimal[] bracket : brackets) {
            BigDecimal bandSize = bracket[0];
            BigDecimal rate = bracket[1];

            if (bandSize == null) {
                // Top bracket — no upper limit
                tax = tax.add(remaining.multiply(rate));
                break;
            }

            if (remaining.compareTo(BigDecimal.ZERO) <= 0) break;

            BigDecimal taxable = remaining.min(bandSize);
            tax = tax.add(taxable.multiply(rate));
            remaining = remaining.subtract(taxable);
        }

        return tax.setScale(2, RoundingMode.HALF_UP);
    }

    private static BigDecimal bd(String val) {
        return new BigDecimal(val);
    }
}

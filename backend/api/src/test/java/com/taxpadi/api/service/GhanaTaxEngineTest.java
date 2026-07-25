package com.taxpadi.api.service;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Conformance tests for the Ghana tax engine (PwC 2025 / Act 1134 & 1151).
 *
 * Guards the graduated PAYE bands, the split of VAT (15%, recoverable) from the
 * NHIL/GETFund levies (2.5% each, not recoverable), and the 5.5% employee SSNIT
 * deduction that reduces the PAYE base.
 */
class GhanaTaxEngineTest {

    private final GhanaTaxEngine engine = new GhanaTaxEngine();

    // ── PAYE: graduated monthly bands ──

    @Test
    void paye_midBand_appliesMarginalRates() {
        // 5,000: 0 + 110@5% + 130@10% + 3167@17.5% + 1103@25%
        //      = 5.50 + 13.00 + 554.225 + 275.75 = 848.475 -> 848.48
        assertThat(engine.calculatePaye(new BigDecimal("5000")))
            .isEqualByComparingTo("848.48");
    }

    @Test
    void paye_topBand_appliesThirtyFivePercentAboveCeiling() {
        // 60,000 reaches the 35% band above 50,417
        assertThat(engine.calculatePaye(new BigDecimal("60000")))
            .isEqualByComparingTo("17082.78");
    }

    @Test
    void paye_firstBandBoundary_isTaxFree() {
        assertThat(engine.calculatePaye(new BigDecimal("490")))
            .isEqualByComparingTo("0.00");
    }

    // ── PAYE: negative / zero income returns zero, never negative ──

    @Test
    void paye_belowThreshold_isZero() {
        assertThat(engine.calculatePaye(new BigDecimal("400")))
            .isEqualByComparingTo("0.00");
    }

    @Test
    void paye_negativeIncome_isZero() {
        assertThat(engine.calculatePaye(new BigDecimal("-1000")))
            .isEqualByComparingTo("0.00");
    }

    @Test
    void paye_null_isZero() {
        assertThat(engine.calculatePaye(null)).isEqualByComparingTo("0.00");
    }

    // ── VAT and levies are computed separately ──

    @Test
    void vat_isFifteenPercent() {
        assertThat(engine.calculateVat(new BigDecimal("1000")))
            .isEqualByComparingTo("150.00");
    }

    @Test
    void nhil_isTwoPointFivePercent() {
        assertThat(engine.calculateNhil(new BigDecimal("1000")))
            .isEqualByComparingTo("25.00");
    }

    @Test
    void getfund_isTwoPointFivePercent() {
        assertThat(engine.calculateGetfund(new BigDecimal("1000")))
            .isEqualByComparingTo("25.00");
    }

    @Test
    void vat_rounding_isHalfUpToTwoDecimals() {
        // 33.33 * 0.15 = 4.9995 -> 5.00
        assertThat(engine.calculateVat(new BigDecimal("33.33")))
            .isEqualByComparingTo("5.00");
    }

    // ── VAT: non-positive supply returns zero ──

    @Test
    void vat_zeroSupply_isZero() {
        assertThat(engine.calculateVat(BigDecimal.ZERO)).isEqualByComparingTo("0.00");
    }

    @Test
    void vat_negativeSupply_isZero() {
        assertThat(engine.calculateVat(new BigDecimal("-500"))).isEqualByComparingTo("0.00");
    }

    // ── SSNIT employee contribution (deducted before PAYE) ──

    @Test
    void ssnit_isFivePointFivePercentOfBasic() {
        assertThat(engine.calculateEmployeeSsnit(new BigDecimal("2000")))
            .isEqualByComparingTo("110.00");
    }

    @Test
    void ssnit_zeroBasic_isZero() {
        assertThat(engine.calculateEmployeeSsnit(BigDecimal.ZERO))
            .isEqualByComparingTo("0.00");
    }

    // ── Annual income tax (drives tax returns) ──

    @Test
    void incomeTax_midBand_appliesMarginalRates() {
        // 50,000: 0 + 1320@5% + 1560@10% + 38000@17.5% + 3240@25%
        //       = 66 + 156 + 6650 + 810 = 7682
        assertThat(engine.calculateIncomeTax(new BigDecimal("50000")))
            .isEqualByComparingTo("7682.00");
    }

    @Test
    void incomeTax_topBand_appliesThirtyFivePercentAbove605k() {
        // 700,000 reaches the 35% band above 605,000
        assertThat(engine.calculateIncomeTax(new BigDecimal("700000")))
            .isEqualByComparingTo("197994.00");
    }

    @Test
    void incomeTax_negative_isZero() {
        assertThat(engine.calculateIncomeTax(new BigDecimal("-1"))).isEqualByComparingTo("0.00");
    }

    // ── Withholding tax: one case per payment type on a GHS 1,000 payment ──

    @Test
    void withholding_appliesCorrectRatePerType() {
        BigDecimal base = new BigDecimal("1000");
        assertThat(engine.calculateWithholding(base, "dividends")).isEqualByComparingTo("80.00");
        assertThat(engine.calculateWithholding(base, "interest")).isEqualByComparingTo("80.00");
        assertThat(engine.calculateWithholding(base, "royalties")).isEqualByComparingTo("150.00");
        assertThat(engine.calculateWithholding(base, "rent_residential")).isEqualByComparingTo("80.00");
        assertThat(engine.calculateWithholding(base, "rent_commercial")).isEqualByComparingTo("150.00");
        assertThat(engine.calculateWithholding(base, "goods")).isEqualByComparingTo("30.00");
        assertThat(engine.calculateWithholding(base, "works")).isEqualByComparingTo("50.00");
        assertThat(engine.calculateWithholding(base, "services")).isEqualByComparingTo("75.00");
        assertThat(engine.calculateWithholding(base, "director_fees")).isEqualByComparingTo("200.00");
    }

    @Test
    void withholding_isCaseInsensitive() {
        assertThat(engine.calculateWithholding(new BigDecimal("1000"), "GOODS"))
            .isEqualByComparingTo("30.00");
    }

    @Test
    void withholding_unknownType_throws() {
        assertThatThrownBy(() -> engine.calculateWithholding(new BigDecimal("1000"), "bribe"))
            .isInstanceOf(IllegalArgumentException.class);
    }
}

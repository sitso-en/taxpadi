package com.taxpadi.api.dto.tax;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

public class TaxLiabilityResponse {
    @JsonProperty("tax_year")
    private int taxYear;

    @JsonProperty("period_start")
    private LocalDate periodStart;

    @JsonProperty("period_end")
    private LocalDate periodEnd;

    @JsonProperty("tax_liability")
    private BigDecimal totalLiability;

    @JsonProperty("total_amount_paid")
    private BigDecimal totalAmountPaid;

    @JsonProperty("net_liability")
    private BigDecimal netLiability;

    @JsonProperty("taxable_income")
    private BigDecimal taxableIncome;

    @JsonProperty("breakdown")
    private Map<String, BigDecimal> breakdown;

    @JsonProperty("next_deadline")
    private LocalDate nextDeadline;

    @JsonProperty("last_updated")
    private LocalDateTime lastUpdated;

    public TaxLiabilityResponse(int taxYear, LocalDate periodStart, LocalDate periodEnd,
                                BigDecimal totalLiability, BigDecimal totalAmountPaid,
                                BigDecimal netLiability, BigDecimal taxableIncome,
                                Map<String, BigDecimal> breakdown, LocalDate nextDeadline,
                                LocalDateTime lastUpdated) {
        this.taxYear = taxYear;
        this.periodStart = periodStart;
        this.periodEnd = periodEnd;
        this.totalLiability = totalLiability;
        this.totalAmountPaid = totalAmountPaid;
        this.netLiability = netLiability;
        this.taxableIncome = taxableIncome;
        this.breakdown = breakdown;
        this.nextDeadline = nextDeadline;
        this.lastUpdated = lastUpdated;
    }

    public int getTaxYear() { return taxYear; }
    public LocalDate getPeriodStart() { return periodStart; }
    public LocalDate getPeriodEnd() { return periodEnd; }
    public BigDecimal getTotalLiability() { return totalLiability; }
    public BigDecimal getTotalAmountPaid() { return totalAmountPaid; }
    public BigDecimal getNetLiability() { return netLiability; }
    public BigDecimal getTaxableIncome() { return taxableIncome; }
    public Map<String, BigDecimal> getBreakdown() { return breakdown; }
    public LocalDate getNextDeadline() { return nextDeadline; }
    public LocalDateTime getLastUpdated() { return lastUpdated; }
}

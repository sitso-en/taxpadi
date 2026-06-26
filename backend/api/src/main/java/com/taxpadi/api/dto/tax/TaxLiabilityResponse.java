package com.taxpadi.api.dto.tax;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class TaxLiabilityResponse {
    private int taxYear;
    private LocalDate periodStart;
    private LocalDate periodEnd;
    private BigDecimal totalLiability;
    private BigDecimal totalAmountPaid;
    private BigDecimal netLiability;
    private List<TaxBreakdownItemDto> breakdown;
    private LocalDateTime lastUpdated;

    public TaxLiabilityResponse(int taxYear, LocalDate periodStart, LocalDate periodEnd,
                                BigDecimal totalLiability, BigDecimal totalAmountPaid,
                                BigDecimal netLiability, List<TaxBreakdownItemDto> breakdown,
                                LocalDateTime lastUpdated) {
        this.taxYear = taxYear;
        this.periodStart = periodStart;
        this.periodEnd = periodEnd;
        this.totalLiability = totalLiability;
        this.totalAmountPaid = totalAmountPaid;
        this.netLiability = netLiability;
        this.breakdown = breakdown;
        this.lastUpdated = lastUpdated;
    }

    public int getTaxYear() { return taxYear; }
    public LocalDate getPeriodStart() { return periodStart; }
    public LocalDate getPeriodEnd() { return periodEnd; }
    public BigDecimal getTotalLiability() { return totalLiability; }
    public BigDecimal getTotalAmountPaid() { return totalAmountPaid; }
    public BigDecimal getNetLiability() { return netLiability; }
    public List<TaxBreakdownItemDto> getBreakdown() { return breakdown; }
    public LocalDateTime getLastUpdated() { return lastUpdated; }
}

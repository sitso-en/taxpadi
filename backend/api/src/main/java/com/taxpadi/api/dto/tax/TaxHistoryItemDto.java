package com.taxpadi.api.dto.tax;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class TaxHistoryItemDto {
    private UUID calculationId;
    private String taxType;
    private LocalDate periodStart;
    private LocalDate periodEnd;
    private BigDecimal grossIncome;
    private BigDecimal totalDeductions;
    private BigDecimal taxableIncome;
    private BigDecimal taxLiability;
    private LocalDateTime calculatedAt;

    public TaxHistoryItemDto(UUID calculationId, String taxType, LocalDate periodStart,
                            LocalDate periodEnd, BigDecimal grossIncome, BigDecimal totalDeductions,
                            BigDecimal taxableIncome, BigDecimal taxLiability, LocalDateTime calculatedAt) {
        this.calculationId = calculationId;
        this.taxType = taxType;
        this.periodStart = periodStart;
        this.periodEnd = periodEnd;
        this.grossIncome = grossIncome;
        this.totalDeductions = totalDeductions;
        this.taxableIncome = taxableIncome;
        this.taxLiability = taxLiability;
        this.calculatedAt = calculatedAt;
    }

    public UUID getCalculationId() { return calculationId; }

    public String getTaxType() { return taxType; }

    public LocalDate getPeriodStart() { return periodStart; }

    public LocalDate getPeriodEnd() { return periodEnd; }

    public BigDecimal getGrossIncome() { return grossIncome; }

    public BigDecimal getTotalDeductions() { return totalDeductions; }

    public BigDecimal getTaxableIncome() { return taxableIncome; }

    public BigDecimal getTaxLiability() { return taxLiability; }
    
    public LocalDateTime getCalculatedAt() { return calculatedAt; }
}

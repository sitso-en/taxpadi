package com.taxpadi.api.dto.tax;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class TaxLiabilityDetailResponse {
    @JsonProperty("tax_type")
    private String taxType;

    @JsonProperty("period_start")
    private LocalDate periodStart;

    @JsonProperty("period_end")
    private LocalDate periodEnd;

    @JsonProperty("gross_income")
    private BigDecimal grossIncome;

    @JsonProperty("total_deductions")
    private BigDecimal totalDeductions;

    @JsonProperty("taxable_income")
    private BigDecimal taxableIncome;

    @JsonProperty("tax_liability")
    private BigDecimal taxLiability;

    @JsonProperty("calculated_at")
    private LocalDateTime calculatedAt;

      public TaxLiabilityDetailResponse(String taxType, LocalDate periodStart, LocalDate periodEnd,
                                         BigDecimal grossIncome, BigDecimal totalDeductions,
                                         BigDecimal taxableIncome, BigDecimal taxLiability,
                                         LocalDateTime calculatedAt) {
          this.taxType = taxType;
          
          this.periodStart = periodStart;

          this.periodEnd = periodEnd;

          this.grossIncome = grossIncome;

          this.totalDeductions = totalDeductions;

          this.taxableIncome = taxableIncome;

          this.taxLiability = taxLiability;

          this.calculatedAt = calculatedAt;
      }

      public String getTaxType() { return taxType; }

      public LocalDate getPeriodStart() { return periodStart; }

      public LocalDate getPeriodEnd() { return periodEnd; }

      public BigDecimal getGrossIncome() { return grossIncome; }

      public BigDecimal getTotalDeductions() { return totalDeductions; }

      public BigDecimal getTaxableIncome() { return taxableIncome; }

      public BigDecimal getTaxLiability() { return taxLiability; }
      
      public LocalDateTime getCalculatedAt() { return calculatedAt; }
}

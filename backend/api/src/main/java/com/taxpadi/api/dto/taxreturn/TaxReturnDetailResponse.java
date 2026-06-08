package com.taxpadi.api.dto.taxreturn;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class TaxReturnDetailResponse {

    private UUID returnId;
    private String taxType;
    private int taxYear;
    private LocalDate periodStart;
    private LocalDate periodEnd;
    private BigDecimal grossIncome;
    private BigDecimal totalDeductions;
    private BigDecimal taxableIncome;
    private BigDecimal taxLiability;
    private String status;
    private LocalDateTime submittedAt;
    private String graReference;
    private PaymentInfo payment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public UUID getReturnId() { return returnId; }
    public void setReturnId(UUID returnId) { this.returnId = returnId; }

    public String getTaxType() { return taxType; }
    public void setTaxType(String taxType) { this.taxType = taxType; }

    public int getTaxYear() { return taxYear; }
    public void setTaxYear(int taxYear) { this.taxYear = taxYear; }

    public LocalDate getPeriodStart() { return periodStart; }
    public void setPeriodStart(LocalDate periodStart) { this.periodStart = periodStart; }

    public LocalDate getPeriodEnd() { return periodEnd; }
    public void setPeriodEnd(LocalDate periodEnd) { this.periodEnd = periodEnd; }

    public BigDecimal getGrossIncome() { return grossIncome; }
    public void setGrossIncome(BigDecimal grossIncome) { this.grossIncome = grossIncome; }

    public BigDecimal getTotalDeductions() { return totalDeductions; }
    public void setTotalDeductions(BigDecimal totalDeductions) { this.totalDeductions = totalDeductions; }

    public BigDecimal getTaxableIncome() { return taxableIncome; }
    public void setTaxableIncome(BigDecimal taxableIncome) { this.taxableIncome = taxableIncome; }

    public BigDecimal getTaxLiability() { return taxLiability; }
    public void setTaxLiability(BigDecimal taxLiability) { this.taxLiability = taxLiability; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }

    public String getGraReference() { return graReference; }
    public void setGraReference(String graReference) { this.graReference = graReference; }

    public PaymentInfo getPayment() { return payment; }
    public void setPayment(PaymentInfo payment) { this.payment = payment; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

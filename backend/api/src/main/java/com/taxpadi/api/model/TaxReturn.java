package com.taxpadi.api.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;


@Entity
@Table(name="tax_returns", uniqueConstraints = @UniqueConstraint(columnNames = {
    "user_id", "tax_type", "period_start", "period_end"
}))
public class TaxReturn {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "return_id", updatable = false, nullable = false)
    private UUID returnId;


    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name= "user_id", nullable = false)
    private User user;


    @Column(name="calculation_id")
    private UUID calculationId;

    @Column(name = "tax_type", nullable = false, length = 20)
    private String taxType;

    @Column(name="tax_year", nullable = false)
    private Integer taxYear;

    @Column(name="period_start", nullable = false)
    private LocalDate periodStart;

    @Column(name="period_end", nullable = false)
    private LocalDate periodEnd;

    @Column(name = "gross_income", nullable = false, precision = 15, scale = 2)
    private BigDecimal grossIncome = BigDecimal.ZERO;

    @Column(name = "total_deductions", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalDeductions = BigDecimal.ZERO;

    @Column(name = "taxable_income", nullable = false, precision = 15, scale = 2)
    private BigDecimal taxableIncome =BigDecimal.ZERO;

    @Column(name = "tax_liability", nullable = false, precision = 15, scale = 2)
    private BigDecimal taxLiability =BigDecimal.ZERO;

    @Column(nullable = false, length=20)
    private String status = "draft";

    @Column(name="submitted_at")
    private LocalDateTime submittedAt;

    @Column(name="gra_reference", length=100)
    private String graReference;

    @Column(name="amendment_reason", length = 500)
    private String amendmentReason;

    @Column(name="amended_at")
    private LocalDateTime amendedAt;

    @Column(name="created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name="updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate(){
        createdAt=LocalDateTime.now();
        updatedAt=LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate(){
        updatedAt = LocalDateTime.now();
    }

    public UUID getReturnId() {
        return returnId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public UUID getCalculationId() {
        return calculationId;
    }

    public void setCalculationId(UUID calculationId) {
        this.calculationId = calculationId;
    }

    public String getTaxType() {
        return taxType;
    }

    public void setTaxType(String taxType) {
        this.taxType = taxType;
    }

    public Integer getTaxYear() {
        return taxYear;
    }

    public void setTaxYear(Integer taxYear) {
        this.taxYear = taxYear;
    }

    public LocalDate getPeriodStart() {
        return periodStart;
    }

    public void setPeriodStart(LocalDate periodStart) {
        this.periodStart = periodStart;
    }

    public LocalDate getPeriodEnd() {
        return periodEnd;
    }

    public void setPeriodEnd(LocalDate periodEnd) {
        this.periodEnd = periodEnd;
    }

    public BigDecimal getGrossIncome() {
        return grossIncome;
    }

    public void setGrossIncome(BigDecimal grossIncome) {
        this.grossIncome = grossIncome;
    }

    public BigDecimal getTotalDeductions() {
        return totalDeductions;
    }

    public void setTotalDeductions(BigDecimal totalDeductions) {
        this.totalDeductions = totalDeductions;
    }

    public BigDecimal getTaxableIncome() {
        return taxableIncome;
    }

    public void setTaxableIncome(BigDecimal taxableIncome) {
        this.taxableIncome = taxableIncome;
    }

    public BigDecimal getTaxLiability() {
        return taxLiability;
    }

    public void setTaxLiability(BigDecimal taxLiability) {
        this.taxLiability = taxLiability;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public String getGraReference() {
        return graReference;
    }

    public void setGraReference(String graReference) {
        this.graReference = graReference;
    }

    public String getAmendmentReason() {
        return amendmentReason;
    }

    public void setAmendmentReason(String amendmentReason) {
        this.amendmentReason = amendmentReason;
    }

    public LocalDateTime getAmendedAt() {
        return amendedAt;
    }

    public void setAmendedAt(LocalDateTime amendedAt) {
        this.amendedAt = amendedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }


    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    

}

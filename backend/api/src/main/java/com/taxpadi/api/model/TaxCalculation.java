package com.taxpadi.api.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Id;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name="tax_calculations")
public class TaxCalculation {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name="calculation_id")
    private UUID calculationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="user_id", nullable= false)
    private User user;

    @Column(name="tax_type", nullable =false, length= 20)
    private String taxType;

    @Column(name="period_start", nullable =false)
    private LocalDate periodStart;

    @Column(name="period_end", nullable =false)
    private LocalDate periodEnd;

    @Column(name ="gross_income", nullable =false, precision =15, scale =2)
    private BigDecimal grossIncome = BigDecimal.ZERO;

    @Column(name = "total_deductions", nullable= false, precision=15, scale =2)
    private BigDecimal totalDeductions = BigDecimal.ZERO;

    @Column(name = "taxable_income", nullable = false, precision = 15, scale = 2)
    private BigDecimal taxableIncome = BigDecimal.ZERO;

    @Column(name = "tax_liability", nullable = false, precision = 15, scale = 2)
    private BigDecimal taxLiability = BigDecimal.ZERO;

    @Column(name = "calculated_at")
    private LocalDateTime calculatedAt;

    @PrePersist
    @PreUpdate
    protected void onCalculate() {
        calculatedAt = LocalDateTime.now();
    }

    public UUID getCalculationId() {
        return calculationId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getTaxType() {
        return taxType;
    }

    public void setTaxType(String taxType) {
        this.taxType = taxType;
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

    public LocalDateTime getCalculatedAt() {
        return calculatedAt;
    }


    
}

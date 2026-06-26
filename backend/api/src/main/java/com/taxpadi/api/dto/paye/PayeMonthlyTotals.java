package com.taxpadi.api.dto.paye;

import java.math.BigDecimal;

public class PayeMonthlyTotals {

    private BigDecimal totalGrossSalary;
    private BigDecimal totalTaxableSalary;
    private BigDecimal totalPayeDeducted;
    private BigDecimal totalRemitted;
    private BigDecimal totalOutstanding;

    public PayeMonthlyTotals(BigDecimal totalGrossSalary, BigDecimal totalTaxableSalary,
                              BigDecimal totalPayeDeducted, BigDecimal totalRemitted,
                              BigDecimal totalOutstanding) {
        this.totalGrossSalary = totalGrossSalary;
        this.totalTaxableSalary = totalTaxableSalary;
        this.totalPayeDeducted = totalPayeDeducted;
        this.totalRemitted = totalRemitted;
        this.totalOutstanding = totalOutstanding;
    }

    public BigDecimal getTotalGrossSalary() { return totalGrossSalary; }
    public void setTotalGrossSalary(BigDecimal totalGrossSalary) { this.totalGrossSalary = totalGrossSalary; }

    public BigDecimal getTotalTaxableSalary() { return totalTaxableSalary; }
    public void setTotalTaxableSalary(BigDecimal totalTaxableSalary) { this.totalTaxableSalary = totalTaxableSalary; }

    public BigDecimal getTotalPayeDeducted() { return totalPayeDeducted; }
    public void setTotalPayeDeducted(BigDecimal totalPayeDeducted) { this.totalPayeDeducted = totalPayeDeducted; }

    public BigDecimal getTotalRemitted() { return totalRemitted; }
    public void setTotalRemitted(BigDecimal totalRemitted) { this.totalRemitted = totalRemitted; }

    public BigDecimal getTotalOutstanding() { return totalOutstanding; }
    public void setTotalOutstanding(BigDecimal totalOutstanding) { this.totalOutstanding = totalOutstanding; }
}

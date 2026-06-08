package com.taxpadi.api.dto.paye;

import java.math.BigDecimal;

public class AnnualTotals {

    private BigDecimal totalGrossSalary;
    private BigDecimal totalTaxableSalary;
    private BigDecimal totalPayeDeducted;
    private BigDecimal totalRemitted;
    private BigDecimal outstanding;

    public AnnualTotals(BigDecimal totalGrossSalary, BigDecimal totalTaxableSalary,
                         BigDecimal totalPayeDeducted, BigDecimal totalRemitted,
                         BigDecimal outstanding) {
        this.totalGrossSalary = totalGrossSalary;
        this.totalTaxableSalary = totalTaxableSalary;
        this.totalPayeDeducted = totalPayeDeducted;
        this.totalRemitted = totalRemitted;
        this.outstanding = outstanding;
    }

    public BigDecimal getTotalGrossSalary() { return totalGrossSalary; }
    public void setTotalGrossSalary(BigDecimal totalGrossSalary) { this.totalGrossSalary = totalGrossSalary; }

    public BigDecimal getTotalTaxableSalary() { return totalTaxableSalary; }
    public void setTotalTaxableSalary(BigDecimal totalTaxableSalary) { this.totalTaxableSalary = totalTaxableSalary; }

    public BigDecimal getTotalPayeDeducted() { return totalPayeDeducted; }
    public void setTotalPayeDeducted(BigDecimal totalPayeDeducted) { this.totalPayeDeducted = totalPayeDeducted; }

    public BigDecimal getTotalRemitted() { return totalRemitted; }
    public void setTotalRemitted(BigDecimal totalRemitted) { this.totalRemitted = totalRemitted; }

    public BigDecimal getOutstanding() { return outstanding; }
    public void setOutstanding(BigDecimal outstanding) { this.outstanding = outstanding; }
}

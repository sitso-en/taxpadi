package com.taxpadi.api.dto.paye;

import java.math.BigDecimal;

public class GrandTotals {

    private int totalEmployees;
    private BigDecimal totalGrossSalary;
    private BigDecimal totalPayeDeducted;
    private BigDecimal totalRemitted;
    private BigDecimal outstanding;

    public GrandTotals(int totalEmployees, BigDecimal totalGrossSalary, BigDecimal totalPayeDeducted,
                        BigDecimal totalRemitted, BigDecimal outstanding) {
        this.totalEmployees = totalEmployees;
        this.totalGrossSalary = totalGrossSalary;
        this.totalPayeDeducted = totalPayeDeducted;
        this.totalRemitted = totalRemitted;
        this.outstanding = outstanding;
    }

    public int getTotalEmployees() { return totalEmployees; }
    public void setTotalEmployees(int totalEmployees) { this.totalEmployees = totalEmployees; }

    public BigDecimal getTotalGrossSalary() { return totalGrossSalary; }
    public void setTotalGrossSalary(BigDecimal totalGrossSalary) { this.totalGrossSalary = totalGrossSalary; }

    public BigDecimal getTotalPayeDeducted() { return totalPayeDeducted; }
    public void setTotalPayeDeducted(BigDecimal totalPayeDeducted) { this.totalPayeDeducted = totalPayeDeducted; }

    public BigDecimal getTotalRemitted() { return totalRemitted; }
    public void setTotalRemitted(BigDecimal totalRemitted) { this.totalRemitted = totalRemitted; }

    public BigDecimal getOutstanding() { return outstanding; }
    public void setOutstanding(BigDecimal outstanding) { this.outstanding = outstanding; }
}

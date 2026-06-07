package com.taxpadi.api.dto.paye;

import java.math.BigDecimal;

public class MonthlyBreakdownItem {

    private int month;
    private BigDecimal grossSalary;
    private BigDecimal taxableSalary;
    private BigDecimal payeDeducted;
    private boolean remitted;

    public MonthlyBreakdownItem(int month, BigDecimal grossSalary, BigDecimal taxableSalary,
                                 BigDecimal payeDeducted, boolean remitted) {
        this.month = month;
        this.grossSalary = grossSalary;
        this.taxableSalary = taxableSalary;
        this.payeDeducted = payeDeducted;
        this.remitted = remitted;
    }

    public int getMonth() { return month; }
    public void setMonth(int month) { this.month = month; }

    public BigDecimal getGrossSalary() { return grossSalary; }
    public void setGrossSalary(BigDecimal grossSalary) { this.grossSalary = grossSalary; }

    public BigDecimal getTaxableSalary() { return taxableSalary; }
    public void setTaxableSalary(BigDecimal taxableSalary) { this.taxableSalary = taxableSalary; }

    public BigDecimal getPayeDeducted() { return payeDeducted; }
    public void setPayeDeducted(BigDecimal payeDeducted) { this.payeDeducted = payeDeducted; }

    public boolean isRemitted() { return remitted; }
    public void setRemitted(boolean remitted) { this.remitted = remitted; }
}

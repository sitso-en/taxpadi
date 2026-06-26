package com.taxpadi.api.dto.report;

import java.math.BigDecimal;

public class MonthlySummaryItem {

    private String month;
    private BigDecimal totalIncome;
    private BigDecimal totalExpenses;
    private BigDecimal netProfit;
    private boolean taxCompliant;

    public MonthlySummaryItem(String month, BigDecimal totalIncome, BigDecimal totalExpenses,
                               BigDecimal netProfit, boolean taxCompliant) {
        this.month = month;
        this.totalIncome = totalIncome;
        this.totalExpenses = totalExpenses;
        this.netProfit = netProfit;
        this.taxCompliant = taxCompliant;
    }

    public String getMonth() { return month; }
    public void setMonth(String month) { this.month = month; }

    public BigDecimal getTotalIncome() { return totalIncome; }
    public void setTotalIncome(BigDecimal totalIncome) { this.totalIncome = totalIncome; }

    public BigDecimal getTotalExpenses() { return totalExpenses; }
    public void setTotalExpenses(BigDecimal totalExpenses) { this.totalExpenses = totalExpenses; }

    public BigDecimal getNetProfit() { return netProfit; }
    public void setNetProfit(BigDecimal netProfit) { this.netProfit = netProfit; }

    public boolean isTaxCompliant() { return taxCompliant; }
    public void setTaxCompliant(boolean taxCompliant) { this.taxCompliant = taxCompliant; }
}

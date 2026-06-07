package com.taxpadi.api.dto.report;

import java.math.BigDecimal;
import java.time.LocalDate;

public class SummaryResponse {

    private LocalDate periodStart;
    private LocalDate periodEnd;
    private IncomeBreakdown income;
    private ExpenseBreakdown expenses;
    private BigDecimal netProfit;
    private TaxLiabilityBreakdown taxLiability;

    public LocalDate getPeriodStart() { return periodStart; }
    public void setPeriodStart(LocalDate periodStart) { this.periodStart = periodStart; }

    public LocalDate getPeriodEnd() { return periodEnd; }
    public void setPeriodEnd(LocalDate periodEnd) { this.periodEnd = periodEnd; }

    public IncomeBreakdown getIncome() { return income; }
    public void setIncome(IncomeBreakdown income) { this.income = income; }

    public ExpenseBreakdown getExpenses() { return expenses; }
    public void setExpenses(ExpenseBreakdown expenses) { this.expenses = expenses; }

    public BigDecimal getNetProfit() { return netProfit; }
    public void setNetProfit(BigDecimal netProfit) { this.netProfit = netProfit; }

    public TaxLiabilityBreakdown getTaxLiability() { return taxLiability; }
    public void setTaxLiability(TaxLiabilityBreakdown taxLiability) { this.taxLiability = taxLiability; }
}

package com.taxpadi.api.dto.report;

import java.math.BigDecimal;

public class Averages {

    private BigDecimal averageMonthlyIncome;
    private BigDecimal averageMonthlyExpenses;
    private BigDecimal averageMonthlyProfit;

    public Averages(BigDecimal averageMonthlyIncome, BigDecimal averageMonthlyExpenses,
                    BigDecimal averageMonthlyProfit) {
        this.averageMonthlyIncome = averageMonthlyIncome;
        this.averageMonthlyExpenses = averageMonthlyExpenses;
        this.averageMonthlyProfit = averageMonthlyProfit;
    }

    public BigDecimal getAverageMonthlyIncome() { return averageMonthlyIncome; }
    public void setAverageMonthlyIncome(BigDecimal averageMonthlyIncome) { this.averageMonthlyIncome = averageMonthlyIncome; }

    public BigDecimal getAverageMonthlyExpenses() { return averageMonthlyExpenses; }
    public void setAverageMonthlyExpenses(BigDecimal averageMonthlyExpenses) { this.averageMonthlyExpenses = averageMonthlyExpenses; }

    public BigDecimal getAverageMonthlyProfit() { return averageMonthlyProfit; }
    public void setAverageMonthlyProfit(BigDecimal averageMonthlyProfit) { this.averageMonthlyProfit = averageMonthlyProfit; }
}

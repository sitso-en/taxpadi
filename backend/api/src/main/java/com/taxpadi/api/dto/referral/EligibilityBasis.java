package com.taxpadi.api.dto.referral;

public class EligibilityBasis {

    private long monthsOfData;
    private double averageMonthlyIncome;
    private int incomeConsistencyScore;
    private boolean taxCompliance;

    public EligibilityBasis(long monthsOfData, double averageMonthlyIncome,
                             int incomeConsistencyScore, boolean taxCompliance) {
        this.monthsOfData = monthsOfData;
        this.averageMonthlyIncome = averageMonthlyIncome;
        this.incomeConsistencyScore = incomeConsistencyScore;
        this.taxCompliance = taxCompliance;
    }

    public long getMonthsOfData() { return monthsOfData; }
    public void setMonthsOfData(long monthsOfData) { this.monthsOfData = monthsOfData; }

    public double getAverageMonthlyIncome() { return averageMonthlyIncome; }
    public void setAverageMonthlyIncome(double averageMonthlyIncome) { this.averageMonthlyIncome = averageMonthlyIncome; }

    public int getIncomeConsistencyScore() { return incomeConsistencyScore; }
    public void setIncomeConsistencyScore(int incomeConsistencyScore) { this.incomeConsistencyScore = incomeConsistencyScore; }

    public boolean isTaxCompliance() { return taxCompliance; }
    public void setTaxCompliance(boolean taxCompliance) { this.taxCompliance = taxCompliance; }
}

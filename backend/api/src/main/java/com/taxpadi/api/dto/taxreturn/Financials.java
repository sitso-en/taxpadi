package com.taxpadi.api.dto.taxreturn;

import java.math.BigDecimal;
import java.util.List;

public class Financials {

    private BigDecimal grossIncome;
    private BigDecimal totalDeductions;
    private BigDecimal taxableIncome;
    private BigDecimal taxLiability;
    private List<BracketBreakdownItem> bracketBreakdown;

    public Financials(BigDecimal grossIncome, BigDecimal totalDeductions, BigDecimal taxableIncome,
                      BigDecimal taxLiability, List<BracketBreakdownItem> bracketBreakdown) {
        this.grossIncome = grossIncome;
        this.totalDeductions = totalDeductions;
        this.taxableIncome = taxableIncome;
        this.taxLiability = taxLiability;
        this.bracketBreakdown = bracketBreakdown;
    }

    public BigDecimal getGrossIncome() { return grossIncome; }
    public void setGrossIncome(BigDecimal grossIncome) { this.grossIncome = grossIncome; }

    public BigDecimal getTotalDeductions() { return totalDeductions; }
    public void setTotalDeductions(BigDecimal totalDeductions) { this.totalDeductions = totalDeductions; }

    public BigDecimal getTaxableIncome() { return taxableIncome; }
    public void setTaxableIncome(BigDecimal taxableIncome) { this.taxableIncome = taxableIncome; }

    public BigDecimal getTaxLiability() { return taxLiability; }
    public void setTaxLiability(BigDecimal taxLiability) { this.taxLiability = taxLiability; }

    public List<BracketBreakdownItem> getBracketBreakdown() { return bracketBreakdown; }
    public void setBracketBreakdown(List<BracketBreakdownItem> bracketBreakdown) { this.bracketBreakdown = bracketBreakdown; }
}

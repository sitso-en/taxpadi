package com.taxpadi.api.dto.taxreturn;

import java.math.BigDecimal;

public class BracketBreakdownItem {

    private String bracket;
    private String rate;
    private BigDecimal tax;

    public BracketBreakdownItem(String bracket, String rate, BigDecimal tax) {
        this.bracket = bracket;
        this.rate = rate;
        this.tax = tax;
    }

    public String getBracket() { return bracket; }
    public void setBracket(String bracket) { this.bracket = bracket; }

    public String getRate() { return rate; }
    public void setRate(String rate) { this.rate = rate; }

    public BigDecimal getTax() { return tax; }
    public void setTax(BigDecimal tax) { this.tax = tax; }
}

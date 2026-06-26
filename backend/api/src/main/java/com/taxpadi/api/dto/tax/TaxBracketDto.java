package com.taxpadi.api.dto.tax;

import java.math.BigDecimal;

public class TaxBracketDto {
    private int bracket;
    private BigDecimal from;
    private BigDecimal to;
    private String rate;
    private String description;

    public TaxBracketDto(int bracket, BigDecimal from, BigDecimal to, String rate, String description) {
        this.bracket = bracket;
        this.from = from;
        this.to = to;
        this.rate = rate;
        this.description = description;
    }

    public int getBracket() { return bracket; }

    public BigDecimal getFrom() { return from; }

    public BigDecimal getTo() { return to; }

    public String getRate() { return rate; }
    
    public String getDescription() { return description; }
  }
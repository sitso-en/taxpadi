package com.taxpadi.api.dto.tax;

import java.math.BigDecimal;

public class TaxBracketDto {
    private int bracket;
    private BigDecimal from;
    private BigDecimal to;
    private String rate;
    private String description;

    public TaxBracketDto() {}

    public TaxBracketDto(int bracket, BigDecimal from, BigDecimal to, String rate, String description) {
        this.bracket = bracket;
        this.from = from;
        this.to = to;
        this.rate = rate;
        this.description = description;
    }

    public int getBracket() { return bracket; }
    public void setBracket(int bracket) { this.bracket = bracket; }

    public BigDecimal getFrom() { return from; }
    public void setFrom(BigDecimal from) { this.from = from; }

    public BigDecimal getTo() { return to; }
    public void setTo(BigDecimal to) { this.to = to; }

    public String getRate() { return rate; }
    public void setRate(String rate) { this.rate = rate; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
  }
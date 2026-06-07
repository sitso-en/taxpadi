package com.taxpadi.api.dto.transaction;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class WithholdingInfo {

    private Boolean applicable;
    private String rate;
    private BigDecimal amount;
    private String message;

    public Boolean getApplicable() { return applicable; }
    public void setApplicable(Boolean applicable) { this.applicable = applicable; }

    public String getRate() { return rate; }
    public void setRate(String rate) { this.rate = rate; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}

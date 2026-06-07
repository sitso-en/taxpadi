package com.taxpadi.api.dto.transaction;

import java.math.BigDecimal;

public class VaultSuggestion {

    private Boolean suggested;
    private BigDecimal suggestedAmount;
    private String message;

    public Boolean getSuggested() { return suggested; }
    public void setSuggested(Boolean suggested) { this.suggested = suggested; }

    public BigDecimal getSuggestedAmount() { return suggestedAmount; }
    public void setSuggestedAmount(BigDecimal suggestedAmount) { this.suggestedAmount = suggestedAmount; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}

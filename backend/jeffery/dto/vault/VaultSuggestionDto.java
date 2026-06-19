package com.taxpadi.api.dto.vault;

import java.math.BigDecimal;

public class VaultSuggestionDto {

    private BigDecimal suggestedAmount;
    private VaultSuggestionBasedOn basedOn;
    private String message;

    public BigDecimal getSuggestedAmount() { return suggestedAmount; }
    public void setSuggestedAmount(BigDecimal v) { this.suggestedAmount = v; }
    public VaultSuggestionBasedOn getBasedOn() { return basedOn; }
    public void setBasedOn(VaultSuggestionBasedOn v) { this.basedOn = v; }
    public String getMessage() { return message; }
    public void setMessage(String v) { this.message = v; }
}

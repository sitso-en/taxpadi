package com.taxpadi.api.dto.vault;

import java.math.BigDecimal;

public class VaultSuggestionBasedOn {

    private BigDecimal latestIncome;
    private String marginalTaxRate;
    private BigDecimal currentLiability;
    private BigDecimal alreadySaved;
    private BigDecimal remainingToSave;

    public VaultSuggestionBasedOn(BigDecimal latestIncome, String marginalTaxRate,
                                   BigDecimal currentLiability, BigDecimal alreadySaved,
                                   BigDecimal remainingToSave) {
        this.latestIncome = latestIncome;
        this.marginalTaxRate = marginalTaxRate;
        this.currentLiability = currentLiability;
        this.alreadySaved = alreadySaved;
        this.remainingToSave = remainingToSave;
    }

    public BigDecimal getLatestIncome() { return latestIncome; }
    public String getMarginalTaxRate() { return marginalTaxRate; }
    public BigDecimal getCurrentLiability() { return currentLiability; }
    public BigDecimal getAlreadySaved() { return alreadySaved; }
    public BigDecimal getRemainingToSave() { return remainingToSave; }
}

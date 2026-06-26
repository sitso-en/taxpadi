package com.taxpadi.api.dto.vault;

import java.math.BigDecimal;

public class VaultTarget {

    private BigDecimal currentTaxLiability;
    private double percentageSaved;
    private BigDecimal amountRemaining;

    public VaultTarget(BigDecimal currentTaxLiability, double percentageSaved, BigDecimal amountRemaining) {
        this.currentTaxLiability = currentTaxLiability;
        this.percentageSaved = percentageSaved;
        this.amountRemaining = amountRemaining;
    }

    public BigDecimal getCurrentTaxLiability() { return currentTaxLiability; }
    public double getPercentageSaved() { return percentageSaved; }
    public BigDecimal getAmountRemaining() { return amountRemaining; }
}

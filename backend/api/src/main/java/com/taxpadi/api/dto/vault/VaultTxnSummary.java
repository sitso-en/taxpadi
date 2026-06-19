package com.taxpadi.api.dto.vault;

import java.math.BigDecimal;

public class VaultTxnSummary {

    private BigDecimal totalCredited;
    private BigDecimal totalDebited;
    private BigDecimal currentBalance;

    public VaultTxnSummary(BigDecimal totalCredited, BigDecimal totalDebited, BigDecimal currentBalance) {
        this.totalCredited = totalCredited;
        this.totalDebited = totalDebited;
        this.currentBalance = currentBalance;
    }

    public BigDecimal getTotalCredited() { return totalCredited; }
    public BigDecimal getTotalDebited() { return totalDebited; }
    public BigDecimal getCurrentBalance() { return currentBalance; }
}

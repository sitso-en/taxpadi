package com.taxpadi.api.dto.payment;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

public class PaymentSummary {
    @JsonProperty("total_paid")
    private BigDecimal totalPaid;

    @JsonProperty("total_pending")
    private BigDecimal totalPending;

    @JsonProperty("total_failed")
    private BigDecimal totalFailed;

    public BigDecimal getTotalPaid() { return totalPaid; }
    public void setTotalPaid(BigDecimal v) { this.totalPaid = v; }

    public BigDecimal getTotalPending() { return totalPending; }
    public void setTotalPending(BigDecimal v) { this.totalPending = v; }

    public BigDecimal getTotalFailed() { return totalFailed; }
    public void setTotalFailed(BigDecimal v) { this.totalFailed = v; }
}

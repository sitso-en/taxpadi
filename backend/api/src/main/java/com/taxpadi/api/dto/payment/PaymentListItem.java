package com.taxpadi.api.dto.payment;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class PaymentListItem {
    @JsonProperty("payment_id")
    private UUID paymentId;

    private BigDecimal amount;

    @JsonProperty("payment_method")
    private String paymentMethod;

    @JsonProperty("payment_reference")
    private String paymentReference;

    private String status;

    @JsonProperty("paid_at")
    private LocalDateTime paidAt;

    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    @JsonProperty("return")
    private LinkedReturnInfo taxReturn;

    private LinkedPenaltyInfo penalty;

    public UUID getPaymentId() { return paymentId; }
    public void setPaymentId(UUID v) { this.paymentId = v; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal v) { this.amount = v; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String v) { this.paymentMethod = v; }

    public String getPaymentReference() { return paymentReference; }
    public void setPaymentReference(String v) { this.paymentReference = v; }

    public String getStatus() { return status; }
    public void setStatus(String v) { this.status = v; }

    public LocalDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(LocalDateTime v) { this.paidAt = v; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime v) { this.createdAt = v; }

    public LinkedReturnInfo getTaxReturn() { return taxReturn; }
    public void setTaxReturn(LinkedReturnInfo v) { this.taxReturn = v; }

    public LinkedPenaltyInfo getPenalty() { return penalty; }
    public void setPenalty(LinkedPenaltyInfo v) { this.penalty = v; }
}

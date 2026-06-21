package com.taxpadi.api.dto.payment;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.util.UUID;

public class InitiatePaymentResponse {
    @JsonProperty("payment_id")
    private UUID paymentId;

    private BigDecimal amount;

    @JsonProperty("payment_method")
    private String paymentMethod;

    private String status;

    @JsonProperty("authorization_url")
    private String authorizationUrl;

    @JsonProperty("payment_reference")
    private String paymentReference;

    private String message;

    public UUID getPaymentId() { return paymentId; }
    public void setPaymentId(UUID v) { this.paymentId = v; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal v) { this.amount = v; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String v) { this.paymentMethod = v; }

    public String getStatus() { return status; }
    public void setStatus(String v) { this.status = v; }

    public String getAuthorizationUrl() { return authorizationUrl; }
    public void setAuthorizationUrl(String v) { this.authorizationUrl = v; }

    public String getPaymentReference() { return paymentReference; }
    public void setPaymentReference(String v) { this.paymentReference = v; }

    public String getMessage() { return message; }
    public void setMessage(String v) { this.message = v; }
}

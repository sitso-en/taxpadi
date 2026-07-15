package com.taxpadi.api.dto.subscription;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class SubscribeResponse {
    @JsonProperty("subscription_id")
    private UUID subscriptionId;

    private String plan;
    private BigDecimal amount;
    private String currency;

    @JsonProperty("payment_reference")
    private String paymentReference;

    private String status;

    @JsonProperty("expires_at")
    private LocalDateTime expiresAt;

    @JsonProperty("authorization_url")
    private String authorizationUrl;

    public UUID getSubscriptionId() { return subscriptionId; }
    public void setSubscriptionId(UUID v) { this.subscriptionId = v; }

    public String getPlan() { return plan; }
    public void setPlan(String v) { this.plan = v; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal v) { this.amount = v; }

    public String getCurrency() { return currency; }
    public void setCurrency(String v) { this.currency = v; }

    public String getPaymentReference() { return paymentReference; }
    public void setPaymentReference(String v) { this.paymentReference = v; }

    public String getStatus() { return status; }
    public void setStatus(String v) { this.status = v; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime v) { this.expiresAt = v; }

    public String getAuthorizationUrl() { return authorizationUrl; }
    public void setAuthorizationUrl(String v) { this.authorizationUrl = v; }
}

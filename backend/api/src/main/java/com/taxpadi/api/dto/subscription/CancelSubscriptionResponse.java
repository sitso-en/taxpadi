package com.taxpadi.api.dto.subscription;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;

public class CancelSubscriptionResponse {
    @JsonProperty("subscription_tier")
    private String subscriptionTier;

    private String status;

    @JsonProperty("access_until")
    private LocalDateTime accessUntil;

    public String getSubscriptionTier() { return subscriptionTier; }
    public void setSubscriptionTier(String v) { this.subscriptionTier = v; }

    public String getStatus() { return status; }
    public void setStatus(String v) { this.status = v; }

    public LocalDateTime getAccessUntil() { return accessUntil; }
    public void setAccessUntil(LocalDateTime v) { this.accessUntil = v; }
}

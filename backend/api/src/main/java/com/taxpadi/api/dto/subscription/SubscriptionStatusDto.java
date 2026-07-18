package com.taxpadi.api.dto.subscription;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class SubscriptionStatusDto {
    @JsonProperty("subscription_tier")
    private String subscriptionTier;
    private String plan;
    private String status;
    @JsonProperty("started_at")
    private LocalDateTime startedAt;
    @JsonProperty("expires_at")
    private LocalDateTime expiresAt;
    @JsonProperty("auto_renew")
    private Boolean autoRenew;
    private SubscriptionFeaturesDto features;

    public String getSubscriptionTier() { return subscriptionTier; }
    public void setSubscriptionTier(String v) { this.subscriptionTier = v; }

    public String getPlan() { return plan; }
    public void setPlan(String v) { this.plan = v; }

    public String getStatus() { return status; }
    public void setStatus(String v) { this.status = v; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime v) { this.startedAt = v; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime v) { this.expiresAt = v; }

    public Boolean getAutoRenew() { return autoRenew; }
    public void setAutoRenew(Boolean v) { this.autoRenew = v; }

    public SubscriptionFeaturesDto getFeatures() { return features; }
    public void setFeatures(SubscriptionFeaturesDto v) { this.features = v; }
}

package com.taxpadi.api.dto.subscription;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class SubscriptionStatusDto {
    private String subscriptionTier;
    private String status;
    private LocalDateTime startedAt;
    private LocalDateTime expiresAt;
    private Boolean autoRenew;
    private SubscriptionFeaturesDto features;

    public String getSubscriptionTier() { return subscriptionTier; }
    public void setSubscriptionTier(String v) { this.subscriptionTier = v; }

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

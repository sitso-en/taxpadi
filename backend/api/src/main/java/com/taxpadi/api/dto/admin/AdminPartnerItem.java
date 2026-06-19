package com.taxpadi.api.dto.admin;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class AdminPartnerItem {

    private UUID partnerId;
    private String name;
    private String offerType;
    private boolean isActive;
    private EligibilityThreshold eligibilityThreshold;
    private int totalOffersGenerated;
    private int totalConverted;
    private LocalDateTime createdAt;

    public UUID getPartnerId() { return partnerId; }
    public void setPartnerId(UUID partnerId) { this.partnerId = partnerId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getOfferType() { return offerType; }
    public void setOfferType(String offerType) { this.offerType = offerType; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public EligibilityThreshold getEligibilityThreshold() { return eligibilityThreshold; }
    public void setEligibilityThreshold(EligibilityThreshold eligibilityThreshold) { this.eligibilityThreshold = eligibilityThreshold; }

    public int getTotalOffersGenerated() { return totalOffersGenerated; }
    public void setTotalOffersGenerated(int totalOffersGenerated) { this.totalOffersGenerated = totalOffersGenerated; }

    public int getTotalConverted() { return totalConverted; }
    public void setTotalConverted(int totalConverted) { this.totalConverted = totalConverted; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

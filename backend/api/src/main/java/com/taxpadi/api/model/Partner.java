package com.taxpadi.api.model;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "partners")
public class Partner {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "partner_id", nullable = false)
    private UUID partnerId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name= "offer_type", nullable = false, length = 20)
    private String offerType;

    @Column(name = "api_key_hash", nullable = false)
    private String apiKeyHash;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "eligibility_threshold", columnDefinition = "jsonb")
    private Map<String, Object> eligibilityThreshold;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "total_offers_generated")
    private int totalOffersGenerated =0;

    @Column(name = "total_converted")
    private int totalConverted =0;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }


    public UUID getPartnerId() {
        return partnerId;
    }


    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getOfferType() {
        return offerType;
    }

    public void setOfferType(String offerType) {
        this.offerType = offerType;
    }

    public String getApiKeyHash() {
        return apiKeyHash;
    }

    public void setApiKeyHash(String apiKeyHash) {
        this.apiKeyHash = apiKeyHash;
    }

    public Map<String, Object> getEligibilityThreshold() {
        return eligibilityThreshold;
    }

    public void setEligibilityThreshold(Map<String, Object> eligibilityThreshold) {
        this.eligibilityThreshold = eligibilityThreshold;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public int getTotalOffersGenerated() {
        return totalOffersGenerated;
    }

    public void setTotalOffersGenerated(int totalOffersGenerated) {
        this.totalOffersGenerated = totalOffersGenerated;
    }

    public int getTotalConverted() {
        return totalConverted;
    }

    public void setTotalConverted(int totalConverted) {
        this.totalConverted = totalConverted;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }



    
}

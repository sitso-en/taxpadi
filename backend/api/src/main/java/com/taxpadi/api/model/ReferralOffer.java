package com.taxpadi.api.model;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name ="referral_offers")
public class ReferralOffer {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name="offer_id")
    private UUID offerId;

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable=false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name="offer_type", nullable = false)
    private OfferType offerType = OfferType.LOAN;

    @Column(name = "partner_name", nullable = false, length=100)
    private String  partnerName;

    @Column(name = "product_name", nullable = false, length = 150)
    private String productName;

    @Column(name = "max_amount", precision = 15, scale = 2)
    private java.math.BigDecimal maxAmount;

    @Column(name = "interest_rate", precision = 5, scale = 2)
    private java.math.BigDecimal interestRate;

    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "deep_link", length = 500)
    private String deepLink;

    @Column(name = "partner_reference", length = 150)
    private String partnerReference;

    @Enumerated(EnumType.STRING)
    @Column(name="status", nullable = false)
    private ReferralStatus status = ReferralStatus.ACTIVE;

    @Column(name = "converted_at", updatable = false)
    private LocalDateTime convertedAt;

    @Column(name = "expires_at", updatable = false)
    private LocalDateTime expiresAt;

    @Column(name="created_at", updatable=false)
    private LocalDateTime createdAt= LocalDateTime.now();

    @Column(name="updated_at")
    private LocalDateTime updatedAt= LocalDateTime.now();


    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @jakarta.persistence.PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }


    public UUID getOfferId() {
        return offerId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public OfferType getOfferType() {
        return offerType;
    }

    public void setOfferType(OfferType offerType) {
        this.offerType = offerType;
    }

    public String getPartnerName() {
        return partnerName;
    }

    public void setPartnerName(String partnerName) {
        this.partnerName = partnerName;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public java.math.BigDecimal getMaxAmount() {
        return maxAmount;
    }

    public void setMaxAmount(java.math.BigDecimal maxAmount) {
        this.maxAmount = maxAmount;
    }

    public java.math.BigDecimal getInterestRate() {
        return interestRate;
    }

    public void setInterestRate(java.math.BigDecimal interestRate) {
        this.interestRate = interestRate;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDeepLink() {
        return deepLink;
    }

    public void setDeepLink(String deepLink) {
        this.deepLink = deepLink;
    }

    public String getPartnerReference() {
        return partnerReference;
    }

    public void setPartnerReference(String partnerReference) {
        this.partnerReference = partnerReference;
    }

    public ReferralStatus getStatus() {
        return status;
    }

    public void setStatus(ReferralStatus status) {
        this.status = status;
    }

    public LocalDateTime getConvertedAt() {
        return convertedAt;
    }

    public void setConvertedAt(LocalDateTime convertedAt) {
        this.convertedAt = convertedAt;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

}
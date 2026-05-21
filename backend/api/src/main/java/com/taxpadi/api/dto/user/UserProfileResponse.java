package com.taxpadi.api.dto.user;

import java.time.LocalDateTime;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.taxpadi.api.model.Role;
import com.taxpadi.api.model.SubscriptionTier;
import com.taxpadi.api.model.TaxpayerCategory;

public class UserProfileResponse {
    @JsonProperty("user_id")
    private UUID userId;

    @JsonProperty("full_name")
    private String fullName;
    
    @JsonProperty("email")
    private String email;

    @JsonProperty("phone")
    private String phone;

    @JsonProperty("tin")
    private String tin;

    @JsonProperty("region")
    private String region;

    @JsonProperty("taxpayer_category")
    private TaxpayerCategory taxpayerCategory;

    @JsonProperty("subscription_tier")
    private SubscriptionTier subscriptionTier;

    @JsonProperty("role")
    private Role role;

    @JsonProperty("is_active")
    private Boolean isActive;

    @JsonProperty("is_verified")
    private Boolean isVerified;

    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    public UserProfileResponse(UUID userId, String fullName, String email, String phone, String tin, String region,
            TaxpayerCategory taxpayerCategory, SubscriptionTier subscriptionTier, Role role, Boolean isActive,
            Boolean isVerified, LocalDateTime createdAt) {
        this.userId = userId;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.tin = tin;
        this.region = region;
        this.taxpayerCategory = taxpayerCategory;
        this.subscriptionTier = subscriptionTier;
        this.role = role;
        this.isActive = isActive;
        this.isVerified = isVerified;
        this.createdAt = createdAt;
    }

    public UUID getUserId() {
        return userId;
    }


    public String getFullName() {
        return fullName;
    }
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getTin() {
        return tin;
    }

    public void setTin(String tin) {
        this.tin = tin;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public TaxpayerCategory getTaxpayerCategory() {
        return taxpayerCategory;
    }

    public void setTaxpayerCategory(TaxpayerCategory taxpayerCategory) {
        this.taxpayerCategory = taxpayerCategory;
    }

    public SubscriptionTier getSubscriptionTier() {
        return subscriptionTier;
    }

    public void setSubscriptionTier(SubscriptionTier subscriptionTier) {
        this.subscriptionTier = subscriptionTier;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Boolean getIsVerified() {
        return isVerified;
    }

    public void setIsVerified(Boolean isVerified) {
        this.isVerified = isVerified;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    
}

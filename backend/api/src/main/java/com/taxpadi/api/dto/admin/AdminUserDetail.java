package com.taxpadi.api.dto.admin;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class AdminUserDetail {

    private UUID userId;
    private String fullName;
    private String phone;
    private String email;
    private String tin;
    private String region;
    private String taxpayerCategory;
    private String subscriptionTier;
    private String role;
    private Boolean isActive;
    private Boolean isVerified;
    private AdminTaxProfileInfo taxProfile;
    private AdminSubscriptionInfo subscription;
    private LocalDateTime createdAt;

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getTin() { return tin; }
    public void setTin(String tin) { this.tin = tin; }

    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }

    public String getTaxpayerCategory() { return taxpayerCategory; }
    public void setTaxpayerCategory(String taxpayerCategory) { this.taxpayerCategory = taxpayerCategory; }

    public String getSubscriptionTier() { return subscriptionTier; }
    public void setSubscriptionTier(String subscriptionTier) { this.subscriptionTier = subscriptionTier; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Boolean getIsVerified() { return isVerified; }
    public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }

    public AdminTaxProfileInfo getTaxProfile() { return taxProfile; }
    public void setTaxProfile(AdminTaxProfileInfo taxProfile) { this.taxProfile = taxProfile; }

    public AdminSubscriptionInfo getSubscription() { return subscription; }
    public void setSubscription(AdminSubscriptionInfo subscription) { this.subscription = subscription; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

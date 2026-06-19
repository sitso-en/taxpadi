package com.taxpadi.api.dto.admin;

import java.time.LocalDateTime;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class AdminUserSummary {
    private UUID userId;
    private String fullName;
    private String phone;
    private String email;
    private String taxpayerCategory;
    private String subscriptionTier;
    private Boolean isActive;
    private Boolean isVerified;
    private LocalDateTime createdAt;


    
    public AdminUserSummary(UUID userId, String fullName, String phone, String email, String taxpayerCategory,
            String subscriptionTier, Boolean isActive, Boolean isVerified, LocalDateTime createdAt) {
        this.userId = userId;
        this.fullName = fullName;
        this.phone = phone;
        this.email = email;
        this.taxpayerCategory = taxpayerCategory;
        this.subscriptionTier = subscriptionTier;
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



    public String getPhone() {
        return phone;
    }



    public void setPhone(String phone) {
        this.phone = phone;
    }



    public String getEmail() {
        return email;
    }



    public void setEmail(String email) {
        this.email = email;
    }



    public String getTaxpayerCategory() {
        return taxpayerCategory;
    }



    public void setTaxpayerCategory(String taxpayerCategory) {
        this.taxpayerCategory = taxpayerCategory;
    }



    public String getSubscriptionTier() {
        return subscriptionTier;
    }



    public void setSubscriptionTier(String subscriptionTier) {
        this.subscriptionTier = subscriptionTier;
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

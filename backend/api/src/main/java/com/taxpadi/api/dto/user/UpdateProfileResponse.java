package com.taxpadi.api.dto.user;

import java.time.LocalDateTime;
import java.util.UUID;

public class UpdateProfileResponse {

    private UUID userId;
    private String fullName;
    private String email;
    private String tin;
    private String region;
    private String taxpayerCategory;
    private LocalDateTime updatedAt;

    public UpdateProfileResponse(UUID userId, String fullName, String email, String tin, String region, String taxpayerCategory, LocalDateTime updatedAt) {
        this.userId = userId;
        this.fullName = fullName;
        this.email = email;
        this.tin = tin;
        this.region = region;
        this.taxpayerCategory = taxpayerCategory;
        this.updatedAt = updatedAt;
    }


    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
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

    public String getTaxpayerCategory() {
        return taxpayerCategory;
    }

    public void setTaxpayerCategory(String taxpayerCategory) {
        this.taxpayerCategory = taxpayerCategory;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
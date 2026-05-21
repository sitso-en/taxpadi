package com.taxpadi.api.dto.profile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class CreateProfileResponse {
    private UUID profileId;
    private String label;
    private String taxpayerCategory;
    private String tin;
    private LocalDate taxYearStart;
    private boolean isActiveProfile;
    private LocalDateTime createdAt;

    public CreateProfileResponse(UUID profileId, String label, String taxpayerCategory,
                                  String tin, LocalDate taxYearStart, boolean isActiveProfile,
                                  LocalDateTime createdAt) {
        this.profileId = profileId;
        this.label = label;
        this.taxpayerCategory = taxpayerCategory;
        this.tin = tin;
        this.taxYearStart = taxYearStart;
        this.isActiveProfile = isActiveProfile;
        this.createdAt = createdAt;
    }

    public UUID getProfileId() { return profileId; }
    public String getLabel() { return label; }
    public String getTaxpayerCategory() { return taxpayerCategory; }
    public String getTin() { return tin; }
    public LocalDate getTaxYearStart() { return taxYearStart; }
    public boolean isActiveProfile() { return isActiveProfile; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}

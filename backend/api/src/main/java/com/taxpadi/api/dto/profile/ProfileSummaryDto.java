package com.taxpadi.api.dto.profile;

import java.time.LocalDateTime;
import java.util.UUID;

public class ProfileSummaryDto {
    private UUID profileId;
    private String label;
    private String taxpayerCategory;
    private String tin;
    private boolean isActiveProfile;
    private LocalDateTime createdAt;

    public ProfileSummaryDto(UUID profileId, String label, String taxpayerCategory,
                              String tin, boolean isActiveProfile, LocalDateTime createdAt) {
        this.profileId = profileId;
        this.label = label;
        this.taxpayerCategory = taxpayerCategory;
        this.tin = tin;
        this.isActiveProfile = isActiveProfile;
        this.createdAt = createdAt;
    }

    public UUID getProfileId() { return profileId; }
    public String getLabel() { return label; }
    public String getTaxpayerCategory() { return taxpayerCategory; }
    public String getTin() { return tin; }
    public boolean isActiveProfile() { return isActiveProfile; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}

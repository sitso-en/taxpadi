package com.taxpadi.api.dto.profile;

import java.util.UUID;

public class SwitchProfileResponse {
    private UUID profileId;
    private String label;
    private String taxpayerCategory;
    private String tin;

    public SwitchProfileResponse(UUID profileId, String label, String taxpayerCategory, String tin) {
        this.profileId = profileId;
        this.label = label;
        this.taxpayerCategory = taxpayerCategory;
        this.tin = tin;
    }

    public UUID getProfileId() { return profileId; }
    public String getLabel() { return label; }
    public String getTaxpayerCategory() { return taxpayerCategory; }
    public String getTin() { return tin; }
}

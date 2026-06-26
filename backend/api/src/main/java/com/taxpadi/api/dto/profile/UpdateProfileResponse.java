package com.taxpadi.api.dto.profile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class UpdateProfileResponse {
    private UUID profileId;
    private String label;
    private LocalDate taxYearStart;
    private LocalDateTime updatedAt;

    public UpdateProfileResponse(UUID profileId, String label, LocalDate taxYearStart, LocalDateTime updatedAt) {
        this.profileId = profileId;
        this.label = label;
        this.taxYearStart = taxYearStart;
        this.updatedAt = updatedAt;
    }

    public UUID getProfileId() { return profileId; }
    public String getLabel() { return label; }
    public LocalDate getTaxYearStart() { return taxYearStart; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}

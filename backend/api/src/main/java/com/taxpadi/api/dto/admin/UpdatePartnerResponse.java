package com.taxpadi.api.dto.admin;

import java.time.LocalDateTime;
import java.util.UUID;

public class UpdatePartnerResponse {

    private UUID partnerId;
    private String name;
    private boolean isActive;
    private LocalDateTime updatedAt;

    public UpdatePartnerResponse(UUID partnerId, String name, boolean isActive, LocalDateTime updatedAt) {
        this.partnerId = partnerId;
        this.name = name;
        this.isActive = isActive;
        this.updatedAt = updatedAt;
    }

    public UUID getPartnerId() { return partnerId; }
    public String getName() { return name; }
    public boolean isActive() { return isActive; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}

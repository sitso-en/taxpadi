package com.taxpadi.api.dto.admin;

import java.time.LocalDateTime;
import java.util.UUID;

public class AdminDeactivateResponse {

    private UUID userId;
    private boolean isActive;
    private LocalDateTime deactivatedAt;

    public AdminDeactivateResponse(UUID userId, boolean isActive, LocalDateTime deactivatedAt) {
        this.userId = userId;
        this.isActive = isActive;
        this.deactivatedAt = deactivatedAt;
    }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public LocalDateTime getDeactivatedAt() { return deactivatedAt; }
    public void setDeactivatedAt(LocalDateTime deactivatedAt) { this.deactivatedAt = deactivatedAt; }
}

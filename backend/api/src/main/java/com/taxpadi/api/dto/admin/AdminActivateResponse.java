package com.taxpadi.api.dto.admin;

import java.time.LocalDateTime;
import java.util.UUID;

public class AdminActivateResponse {

    private UUID userId;
    private boolean isActive;
    private LocalDateTime reactivatedAt;

    public AdminActivateResponse(UUID userId, boolean isActive, LocalDateTime reactivatedAt) {
        this.userId = userId;
        this.isActive = isActive;
        this.reactivatedAt = reactivatedAt;
    }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public LocalDateTime getReactivatedAt() { return reactivatedAt; }
    public void setReactivatedAt(LocalDateTime reactivatedAt) { this.reactivatedAt = reactivatedAt; }
}

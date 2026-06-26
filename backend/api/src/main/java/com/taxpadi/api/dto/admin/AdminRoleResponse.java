package com.taxpadi.api.dto.admin;

import java.time.LocalDateTime;
import java.util.UUID;

public class AdminRoleResponse {

    private UUID userId;
    private String role;
    private LocalDateTime updatedAt;

    public AdminRoleResponse(UUID userId, String role, LocalDateTime updatedAt) {
        this.userId = userId;
        this.role = role;
        this.updatedAt = updatedAt;
    }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

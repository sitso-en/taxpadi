package com.taxpadi.api.dto.admin;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class AdminSubscriptionInfo {

    private String plan;
    private String status;
    private LocalDateTime expiresAt;

    public AdminSubscriptionInfo(String plan, String status, LocalDateTime expiresAt) {
        this.plan = plan;
        this.status = status;
        this.expiresAt = expiresAt;
    }

    public String getPlan() { return plan; }
    public String getStatus() { return status; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
}

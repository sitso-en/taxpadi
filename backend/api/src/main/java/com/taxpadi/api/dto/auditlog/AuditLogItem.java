package com.taxpadi.api.dto.auditlog;

import java.time.LocalDateTime;
import java.util.UUID;

public class AuditLogItem {

    private UUID logId;
    private String action;
    private String detail;
    private String ipAddress;
    private LocalDateTime createdAt;

    public UUID getLogId() { return logId; }
    public void setLogId(UUID logId) { this.logId = logId; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getDetail() { return detail; }
    public void setDetail(String detail) { this.detail = detail; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

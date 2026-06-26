package com.taxpadi.api.dto.auditlog;

import com.taxpadi.api.dto.common.PaginationInfo;

import java.util.List;

public class AuditLogListResponse {

    private List<AuditLogItem> logs;
    private PaginationInfo pagination;

    public AuditLogListResponse(List<AuditLogItem> logs, PaginationInfo pagination) {
        this.logs = logs;
        this.pagination = pagination;
    }

    public List<AuditLogItem> getLogs() { return logs; }
    public void setLogs(List<AuditLogItem> logs) { this.logs = logs; }

    public PaginationInfo getPagination() { return pagination; }
    public void setPagination(PaginationInfo pagination) { this.pagination = pagination; }
}

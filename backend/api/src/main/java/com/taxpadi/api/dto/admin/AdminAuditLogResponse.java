package com.taxpadi.api.dto.admin;

import com.taxpadi.api.dto.common.PaginationInfo;

import java.util.List;

public class AdminAuditLogResponse {

    private List<AdminAuditLogItem> logs;
    private PaginationInfo pagination;

    public AdminAuditLogResponse(List<AdminAuditLogItem> logs, PaginationInfo pagination) {
        this.logs = logs;
        this.pagination = pagination;
    }

    public List<AdminAuditLogItem> getLogs() { return logs; }
    public PaginationInfo getPagination() { return pagination; }
}

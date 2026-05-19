package com.taxpadi.api.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.taxpadi.api.common.ApiResponse;
import com.taxpadi.api.model.User;
import com.taxpadi.api.security.TaxPadiUserDetails;
import com.taxpadi.api.service.AuditLogService;

@RestController
@RequestMapping("/api/v1/audit-log")
public class AuditLogController {
    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAuditLogs(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            auditLogService.getLogs(user, page, limit),
            "Audit logs retrieved successfully."));
    }
}

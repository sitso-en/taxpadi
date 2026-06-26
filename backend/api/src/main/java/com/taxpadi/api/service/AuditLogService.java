package com.taxpadi.api.service;

import com.taxpadi.api.dto.auditlog.AuditLogItem;
import com.taxpadi.api.dto.auditlog.AuditLogListResponse;
import com.taxpadi.api.dto.common.PaginationInfo;
import com.taxpadi.api.model.AuditLog;
import com.taxpadi.api.model.User;
import com.taxpadi.api.repository.AuditLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void log(User user, String action, String detail, String ipAddress) {
        AuditLog logs = new AuditLog();
        logs.setUser(user);
        logs.setAction(action);
        logs.setDetail(detail);
        logs.setIpAddress(ipAddress);
        auditLogRepository.save(logs);
    }

    public AuditLogListResponse getLogs(User user, int page, int limit) {
        int safePage = Math.max(0, page - 1);
        int safeLimit = Math.min(limit, 100);

        Page<AuditLog> results = auditLogRepository.findAllByUserOrderByCreatedAtDesc(
            user, PageRequest.of(safePage, safeLimit)
        );

        List<AuditLogItem> logs = results.getContent().stream()
            .map(log -> {
                AuditLogItem item = new AuditLogItem();
                item.setLogId(log.getLogId());
                item.setAction(log.getAction());
                item.setDetail(log.getDetail());
                item.setIpAddress(log.getIpAddress());
                item.setCreatedAt(log.getCreatedAt());
                return item;
            }).toList();

        return new AuditLogListResponse(
            logs,
            new PaginationInfo(results.getTotalElements(), page, safeLimit, results.getTotalPages())
        );
    }
}

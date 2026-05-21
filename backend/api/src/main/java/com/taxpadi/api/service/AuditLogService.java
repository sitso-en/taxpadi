package com.taxpadi.api.service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.taxpadi.api.model.AuditLog;
import com.taxpadi.api.model.User;
import com.taxpadi.api.repository.AuditLogRepository;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository){
        this.auditLogRepository=auditLogRepository;
    }

    public void log(User user, String action, String detail, String ipAddress){
        AuditLog logs = new AuditLog();

        logs.setUser(user);
        logs.setAction(action);
        logs.setDetail(detail);
        logs.setIpAddress(ipAddress);

        auditLogRepository.save(logs);
    }



    public Map<String, Object> getLogs(User user, int page, int limit) {
        
        int safePage = Math.max(0, page - 1);
        int safeLimit = Math.min(limit, 100);
        
        Page<AuditLog> results = auditLogRepository.findAllByUserOrderByCreatedAtDesc(
            user, PageRequest.of(safePage, safeLimit)
        );


        List<Map<String, Object>> logs = results.getContent().stream()
            .map(log -> {
                Map<String, Object> l = new LinkedHashMap<>();
                l.put("log_id", log.getLogId());
                l.put("action", log.getAction());
                l.put("detail", log.getDetail());
                l.put("ip_address", log.getIpAddress());
                l.put("created_at", log.getCreatedAt());
                return l;
            }).toList();

        return Map.of(
            "logs", logs,
            "pagination", Map.of(
                "total", results.getTotalElements(),
                "page", page,
                "limit", safeLimit,
                "total_pages", results.getTotalPages()
            )
        );
    }

        
}
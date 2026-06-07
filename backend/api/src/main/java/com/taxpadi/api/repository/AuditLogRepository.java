package com.taxpadi.api.repository;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.taxpadi.api.model.AuditLog;
import com.taxpadi.api.model.User;

public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {

    Page <AuditLog> findAllByUserOrderByCreatedAtDesc(User user, Pageable pageable);
    
    @Query("""
      SELECT a FROM AuditLog a
      WHERE (:userId IS NULL OR a.user.userId = :userId)
      AND (:action IS NULL OR a.action = :action)
      AND (:dateFrom IS NULL OR a.createdAt >= :dateFrom)
      AND (:dateTo IS NULL OR a.createdAt <= :dateTo)
      ORDER BY a.createdAt DESC
      """)
    Page<AuditLog> findAllByFilters(
        @Param("userId") UUID userId,
        @Param("action") String action,
        @Param("dateFrom") LocalDateTime dateFrom,
        @Param("dateTo") LocalDateTime dateTo,
        Pageable pageable
    );
}

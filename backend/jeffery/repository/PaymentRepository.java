package com.taxpadi.repository;

import com.taxpadi.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, String> {

    Optional<Payment> findByPaymentIdAndUserId(String paymentId, String userId);

    Page<Payment> findByUserId(String userId, Pageable pageable);

    @Query("SELECT p FROM Payment p WHERE p.userId = :userId " +
            "AND (:status IS NULL OR p.status = :status) " +
            "AND (:method IS NULL OR p.paymentMethod = :method) " +
            "AND (:from IS NULL OR p.createdAt >= :from) " +
            "AND (:to IS NULL OR p.createdAt <= :to)")
    Page<Payment> findFiltered(
            @Param("userId") String userId,
            @Param("status") String status,
            @Param("method") String method,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            Pageable pageable);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.userId = :userId AND p.status = :status")
    BigDecimal sumByUserIdAndStatus(@Param("userId") String userId, @Param("status") String status);

    boolean existsByReturnIdAndStatus(String returnId, String status);
    boolean existsByPenaltyIdAndStatus(String penaltyId, String status);
}
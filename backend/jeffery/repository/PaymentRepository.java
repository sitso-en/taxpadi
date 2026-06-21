package com.taxpadi.api.repository;

import com.taxpadi.api.model.Payment;
import com.taxpadi.api.model.Penalty;
import com.taxpadi.api.model.TaxReturn;
import com.taxpadi.api.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    Optional<Payment> findByPaymentIdAndUser(UUID paymentId, User user);

    Page<Payment> findByUser(User user, Pageable pageable);

    @Query("SELECT p FROM Payment p WHERE p.user = :user " +
            "AND (:status IS NULL OR p.status = :status) " +
            "AND (:method IS NULL OR p.paymentMethod = :method) " +
            "AND (:from IS NULL OR p.createdAt >= :from) " +
            "AND (:to IS NULL OR p.createdAt <= :to)")
    Page<Payment> findFiltered(
            @Param("user") User user,
            @Param("status") String status,
            @Param("method") String method,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            Pageable pageable);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.user = :user AND p.status = :status")
    BigDecimal sumByUserAndStatus(@Param("user") User user, @Param("status") String status);

    boolean existsByTaxReturnAndStatus(TaxReturn taxReturn, String status);
    boolean existsByPenaltyAndStatus(Penalty penalty, String status);
}
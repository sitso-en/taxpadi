package com.taxpadi.api.repository;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.taxpadi.api.model.Payment;
import com.taxpadi.api.model.Penalty;
import com.taxpadi.api.model.TaxReturn;
import com.taxpadi.api.model.User;

public interface PaymentRepository extends JpaRepository<Payment, UUID>, JpaSpecificationExecutor<Payment> {

    Optional<Payment> findByPaymentIdAndUser(UUID paymentId, User user);

    Page<Payment> findByUser(User user, Pageable pageable);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.user = :user AND p.status = :status")
    BigDecimal sumByUserAndStatus(@Param("user") User user, @Param("status") String status);

    Optional<Payment> findByPaymentReference(String paymentReference);

    boolean existsByTaxReturnAndStatus(TaxReturn taxReturn, String status);
    boolean existsByPenaltyAndStatus(Penalty penalty, String status);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.user = :user AND p.status = 'successful' AND p.taxReturn IS NOT NULL AND p.taxReturn.periodStart >= :from AND p.taxReturn.periodEnd <= :to")
    BigDecimal sumSuccessfulTaxPaymentsByUserAndDateRange(
        @Param("user") User user,
        @Param("from") java.time.LocalDate from,
        @Param("to") java.time.LocalDate to
    );

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.user = :user AND p.status = 'successful' AND p.taxReturn IS NOT NULL")
    BigDecimal sumAllSuccessfulTaxPaymentsByUser(@Param("user") User user);
}

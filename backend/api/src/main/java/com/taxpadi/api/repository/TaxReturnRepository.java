package com.taxpadi.api.repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.taxpadi.api.model.TaxReturn;
import com.taxpadi.api.model.User;

public interface TaxReturnRepository extends JpaRepository<TaxReturn, UUID> {
    @Query("""
        SELECT r FROM TaxReturn r
        WHERE r.user = :user
        AND (:taxType IS NULL OR r.taxType = :taxType)
        AND (:status IS NULL OR r.status = :status)
        AND (:year IS NULL OR r.taxYear = :year)
        ORDER BY r.createdAt DESC
        """)
        
    Page<TaxReturn> findAllByFilters(
        @Param("user") User user,
        @Param("taxType") String taxType,
        @Param("status") String status,
        @Param("year") Integer year,
        Pageable pageable
    );

    Optional<TaxReturn> findByReturnIdAndUser(UUID returnId, User user);

    Optional<TaxReturn> findByUserAndTaxTypeAndPeriodStartAndPeriodEnd(
        User user, String taxType, LocalDate periodStart, LocalDate periodEnd
    );
}

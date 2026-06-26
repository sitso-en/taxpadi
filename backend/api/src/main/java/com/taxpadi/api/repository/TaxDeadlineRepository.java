package com.taxpadi.api.repository;

import com.taxpadi.api.model.TaxDeadline;
import com.taxpadi.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TaxDeadlineRepository extends JpaRepository<TaxDeadline, UUID> {
    List<TaxDeadline> findByIsActiveTrue();

    @Query("SELECT d FROM TaxDeadline d WHERE d.dueDate BETWEEN :from AND :to AND d.isActive = true")
    List<TaxDeadline> findUpcoming(@Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT d FROM TaxDeadline d WHERE d.dueDate < :today AND d.status != 'COMPLETED' AND d.isActive = true")
    List<TaxDeadline> findOverdue(@Param("today") LocalDate today);

    Optional<TaxDeadline> findByUserAndTaxTypeAndPeriodStartAndPeriodEnd(
            User user, String taxType, LocalDate periodStart, LocalDate periodEnd);
}

package com.taxpadi.api.repository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.taxpadi.api.model.TaxDeadline;
import com.taxpadi.api.model.User;

public interface TaxDeadlineRepository extends JpaRepository<TaxDeadline, UUID> {
    List<TaxDeadline> findByIsActiveTrue();

    @Query("SELECT d FROM TaxDeadline d WHERE d.dueDate BETWEEN :from AND :to AND d.isActive = true")
    List<TaxDeadline> findUpcoming(@Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT d FROM TaxDeadline d WHERE d.dueDate < :today AND d.status != 'COMPLETED' AND d.isActive = true")
    List<TaxDeadline> findOverdue(@Param("today") LocalDate today);

    Optional<TaxDeadline> findFirstByUserAndTaxTypeAndPeriodStartAndPeriodEnd(
            User user, String taxType, LocalDate periodStart, LocalDate periodEnd);

    @Query("SELECT COUNT(d) FROM TaxDeadline d WHERE d.user IS NULL AND d.isActive = true " +
           "AND d.periodStart >= :start AND d.periodStart <= :end")
    long countGlobalDeadlinesByPeriodYear(@Param("start") LocalDate start, @Param("end") LocalDate end);


    Page<TaxDeadline> findByIsActiveTrueAndTaxTypeIn(Collection<String> taxTypes, Pageable pageable);

    @Query("SELECT d FROM TaxDeadline d WHERE d.isActive = true AND d.completed = false " +
           "AND d.dueDate >= :today AND (d.user IS NULL OR d.user = :user) ORDER BY d.dueDate ASC")
    List<TaxDeadline> findNextUpcoming(@Param("today") LocalDate today, @Param("user") User user, Pageable pageable);
}

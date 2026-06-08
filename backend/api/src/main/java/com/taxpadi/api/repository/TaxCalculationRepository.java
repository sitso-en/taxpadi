package com.taxpadi.api.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;

import com.taxpadi.api.model.TaxCalculation;
import com.taxpadi.api.model.User;

public interface TaxCalculationRepository extends JpaRepository<TaxCalculation, UUID> {
    List<TaxCalculation> findAllByUser(User user);

    Optional<TaxCalculation> findByUserAndTaxTypeAndPeriodStartAndPeriodEnd(
        User user, String taxType, LocalDate periodStart, LocalDate periodEnd);

    Page<TaxCalculation> findAllByUserOrderByPeriodStartDesc(User user, Pageable pageable);

    Page<TaxCalculation> findAllByUserAndTaxTypeOrderByPeriodStartDesc(
        User user, String taxType, Pageable pageable);

}

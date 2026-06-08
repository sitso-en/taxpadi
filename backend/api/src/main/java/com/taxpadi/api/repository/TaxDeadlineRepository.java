package com.taxpadi.api.repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.taxpadi.api.model.TaxDeadline;
import com.taxpadi.api.model.User;

public interface TaxDeadlineRepository extends JpaRepository<TaxDeadline, UUID> {
    Optional<TaxDeadline> findByUserAndTaxTypeAndPeriodStartAndPeriodEnd(                                                                                                                     
        User user, String taxType, LocalDate periodStart, LocalDate periodEnd                                                                                                               
    ); 
    
} 
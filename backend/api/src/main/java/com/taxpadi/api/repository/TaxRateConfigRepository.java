package com.taxpadi.api.repository;

import com.taxpadi.api.model.TaxRateConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface TaxRateConfigRepository extends JpaRepository<TaxRateConfig, UUID> {

    Optional<TaxRateConfig> findTopByOrderByTaxYearDesc();

    Optional<TaxRateConfig> findByTaxYear(int taxYear);
}

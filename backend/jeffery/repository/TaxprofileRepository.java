package com.taxpadi.repository;

import com.taxpadi.entity.TaxProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TaxProfileRepository extends JpaRepository<TaxProfile, String> {
    Optional<TaxProfile> findByUserId(String userId);
    boolean existsByUserId(String userId);
}
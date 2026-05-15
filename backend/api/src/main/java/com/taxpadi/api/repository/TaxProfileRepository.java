package com.taxpadi.api.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.taxpadi.api.model.TaxProfile;
import com.taxpadi.api.model.User;

public interface TaxProfileRepository extends JpaRepository<TaxProfile, UUID>{
    List<TaxProfile> findAllByUser(User user);

    long countByUser(User user);

    Optional<TaxProfile> findByProfileIdAndUser(UUID profileId, User user);

    Optional<TaxProfile> findByUserAndIsPrimaryTrue(User user);
    
}

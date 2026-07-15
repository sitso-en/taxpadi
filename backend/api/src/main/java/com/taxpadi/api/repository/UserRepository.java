package com.taxpadi.api.repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.taxpadi.api.model.SubscriptionTier;
import com.taxpadi.api.model.User;

public interface UserRepository extends JpaRepository<User, UUID>, JpaSpecificationExecutor<User> {
    Optional<User> findByPhone(String phone);
    Optional<User> findByEmail(String email);

    long countByIsActive(Boolean isActive);
    long countByIsVerified(Boolean isVerified);
    long countBySubscriptionTier(SubscriptionTier tier);
    long countByCreatedAtBetween(LocalDateTime from, LocalDateTime to);
}

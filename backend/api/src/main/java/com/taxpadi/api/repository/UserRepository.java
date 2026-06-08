package com.taxpadi.api.repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.taxpadi.api.model.SubscriptionTier;
import com.taxpadi.api.model.TaxpayerCategory;
import com.taxpadi.api.model.User;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByPhone(String phone);
    Optional<User> findByEmail(String email);

    @Query("""
            SELECT u FROM User u
            WHERE (:subscriptionTier IS NULL OR u.subscriptionTier = :subscriptionTier)
            AND (:taxpayerCategory IS NULL OR u.taxpayerCategory = :taxpayerCategory)
            AND (:isActive IS NULL OR u.isActive = :isActive)
            AND (:dateFrom IS NULL OR u.createdAt >= :dateFrom)
            AND (:dateTo IS NULL OR u.createdAt <= :dateTo)
            ORDER BY u.createdAt DESC
            """)

    Page<User> findAllByFilters(
        @Param("subscriptionTier") SubscriptionTier subscriptionTier,
        @Param("taxpayerCategory") TaxpayerCategory taxpayerCategory,
        @Param("isActive") Boolean isActive,
        @Param("dateFrom") LocalDateTime dateFrom,
        @Param("dateTo") LocalDateTime dateTo,
        Pageable pageable
    );
}

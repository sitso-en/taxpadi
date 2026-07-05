package com.taxpadi.api.repository;

import com.taxpadi.api.model.Subscription;
import com.taxpadi.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {

    Optional<Subscription> findByUserAndStatus(User user, String status);

    boolean existsByUserAndStatus(User user, String status);

    Optional<Subscription> findByPaymentReference(String paymentReference);

    @Query("SELECT s FROM Subscription s WHERE s.user = :user ORDER BY s.createdAt DESC")
    Optional<Subscription> findLatestByUser(@Param("user") User user);

    @Query("SELECT s FROM Subscription s WHERE s.status IN (:active, :cancelled) AND s.expiresAt < :now")
    List<Subscription> findExpired(
        @Param("active") String active,
        @Param("cancelled") String cancelled,
        @Param("now") LocalDateTime now
    );
}

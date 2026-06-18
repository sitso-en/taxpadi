package com.taxpadi.jeffery.repository;

import com.taxpadi.jeffery.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface SubscriptionRepository extends JpaRepository<Subscription, String> {

    Optional<Subscription> findByUserIdAndStatus(String userId, String status);

    boolean existsByUserIdAndStatus(String userId, String status);

    @Query("SELECT s FROM Subscription s WHERE s.userId = :userId ORDER BY s.createdAt DESC")
    Optional<Subscription> findLatestByUserId(@Param("userId") String userId);
}
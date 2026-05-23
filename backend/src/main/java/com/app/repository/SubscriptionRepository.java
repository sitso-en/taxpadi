package com.app.repository;
import com.app.entity.Subscription;
import com.app.enums.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
public interface SubscriptionRepository extends JpaRepository<Subscription,Long> {
    Optional<Subscription> findByUserIdAndStatus(Long userId, SubscriptionStatus status);
    List<Subscription> findByUserId(Long userId);
    @Query("SELECT s FROM Subscription s WHERE s.status='ACTIVE' AND s.nextBillingDate<=:now AND s.autoRenew=true")
    List<Subscription> findDueForRenewal(@Param("now") LocalDateTime now);
}

package com.taxpadi.api.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.taxpadi.api.model.Notification;
import com.taxpadi.api.model.User;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    Page<Notification> findAllByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    Optional<Notification> findByNotificationIdAndUser(UUID notificationId, User user);

    long countByUserAndReadFalse(User user);

    void deleteAllByUser(User user);

    @Modifying
    @Query(value = """
            INSERT INTO notifications (notification_id, user_id, title, body, type, read, action_url, created_at)
            SELECT gen_random_uuid(), u.user_id, :title, :body, :type, false, :actionUrl, now()
            FROM users u WHERE u.is_active = true
            """, nativeQuery = true)
    void broadcastToAllActiveUsers(@Param("title") String title,
                                   @Param("body") String body,
                                   @Param("type") String type,
                                   @Param("actionUrl") String actionUrl);
}

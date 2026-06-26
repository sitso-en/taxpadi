package com.taxpadi.api.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.taxpadi.api.model.Notification;
import com.taxpadi.api.model.User;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    Page<Notification> findAllByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    Optional<Notification> findByNotificationIdAndUser(UUID notificationId, User user);

    long countByUserAndReadFalse(User user);

    void deleteAllByUser(User user);
}

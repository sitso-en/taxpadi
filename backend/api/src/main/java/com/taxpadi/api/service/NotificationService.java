package com.taxpadi.api.service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.google.firebase.messaging.FirebaseMessaging;
import com.taxpadi.api.exception.NotFoundException;
import com.taxpadi.api.model.DeviceToken;
import com.taxpadi.api.model.Notification;
import com.taxpadi.api.model.NotificationType;
import com.taxpadi.api.model.User;
import com.taxpadi.api.repository.DeviceTokenRepository;
import com.taxpadi.api.repository.NotificationRepository;
import com.taxpadi.api.repository.UserRepository;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final DeviceTokenRepository deviceTokenRepository;
    private final UserRepository userRepository;
    private final FirebaseMessaging firebaseMessaging;

    public NotificationService(NotificationRepository notificationRepository,
            DeviceTokenRepository deviceTokenRepository,
            UserRepository userRepository,
            FirebaseMessaging firebaseMessaging) {
        this.notificationRepository = notificationRepository;
        this.deviceTokenRepository = deviceTokenRepository;
        this.userRepository = userRepository;
        this.firebaseMessaging = firebaseMessaging;
    }


    public void registerFcmToken(User user, String fcmToken, String deviceInfo, String platform) {
        DeviceToken device = new DeviceToken();
        device.setUser(user);
        device.setFcmToken(fcmToken);
        device.setDeviceInfo(deviceInfo);
        device.setPlatform(platform);
        deviceTokenRepository.save(device);
    }

    public void unregisterFcmToken(User user, String fcmToken) {
        DeviceToken device = deviceTokenRepository.findByFcmTokenAndUser(fcmToken, user)
            .orElseThrow(() -> new NotFoundException("FCM token not found"));
        device.setIsActive(false);
        deviceTokenRepository.save(device);
    }


    public Map<String, Object> getNotifications(User user, int page, int limit) {
        int safePage = Math.max(0, page - 1);
        int safeLimit = Math.min(limit, 100);

        Page<Notification> results = notificationRepository
            .findAllByUserOrderByCreatedAtDesc(user, PageRequest.of(safePage, safeLimit));

        List<Map<String, Object>> notifications = results.getContent().stream()
            .map(i -> {
                Map<String, Object> notif = new LinkedHashMap<>();
                notif.put("notification_id", i.getNotificationId());
                notif.put("title", i.getTitle());
                notif.put("body", i.getBody());
                notif.put("type", i.getType());
                notif.put("read", i.getRead());
                notif.put("action_url", i.getActionUrl());
                notif.put("created_at", i.getCreatedAt());
                return notif;
            }).toList();

        return Map.of(
            "notifications", notifications,
            "pagination", Map.of(
                "total", results.getTotalElements(),
                "page", page,
                "limit", safeLimit,
                "total_pages", results.getTotalPages()
            )
        );
    }

    public long getUnreadCount(User user) {
        return notificationRepository.countByUserAndReadFalse(user);
    }



    public Map<String, Object> getNotification(User user, UUID id) {
        Notification n = notificationRepository.findByNotificationIdAndUser(id, user)
            .orElseThrow(() -> new NotFoundException("Notification not found"));

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("notification_id", n.getNotificationId());
        result.put("title", n.getTitle());
        result.put("body", n.getBody());
        result.put("type", n.getType());
        result.put("read", n.getRead());
        result.put("action_url", n.getActionUrl());
        result.put("created_at", n.getCreatedAt());
        return result;
    }

    @Transactional
    public void markAsRead(User user, UUID id) {
        Notification n = notificationRepository.findByNotificationIdAndUser(id, user)
            .orElseThrow(() -> new NotFoundException("Notification not found"));
        n.setRead(true);
        notificationRepository.save(n);
    }

    @Transactional
    public void markAllAsRead(User user) {
        List<Notification> unread = notificationRepository
            .findAllByUserOrderByCreatedAtDesc(user, Pageable.unpaged())
            .getContent()
            .stream()
            .filter(n -> !Boolean.TRUE.equals(n.getRead()))
            .toList();
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    @Transactional
    public void deleteNotification(User user, UUID id) {
        Notification n = notificationRepository.findByNotificationIdAndUser(id, user)
            .orElseThrow(() -> new NotFoundException("Notification not found"));
        notificationRepository.delete(n);
    }

    @Transactional
    public void clearAll(User user) {
        notificationRepository.deleteAllByUser(user);
    }


    public Map<String, Boolean> getPreferences(User user) {
        return user.getNotificationPreferences();
    }

    @Transactional
    public void updatePreferences(User user, Map<String, Boolean> prefs) {
        user.setNotificationPreferences(prefs);
        userRepository.save(user);
    }


    public void send(User user, String title, String body, NotificationType type, String actionUrl) {
        Notification n = new Notification();
        n.setUser(user);
        n.setTitle(title);
        n.setBody(body);
        n.setType(type);
        n.setActionUrl(actionUrl);
        notificationRepository.save(n);

        List<DeviceToken> tokens = deviceTokenRepository.findAll().stream()
            .filter(t -> t.getUser().getUserId().equals(user.getUserId())
                && Boolean.TRUE.equals(t.getIsActive())
                && t.getFcmToken() != null)
            .toList();

        for (DeviceToken token : tokens) {
            try {
                com.google.firebase.messaging.Message message = com.google.firebase.messaging.Message.builder()
                    .setToken(token.getFcmToken())
                    .setNotification(com.google.firebase.messaging.Notification.builder()
                        .setTitle(title)
                        .setBody(body)
                        .build())
                    .build();
                firebaseMessaging.send(message);
            } catch (Exception e) {
                //dont fail if push delivery fails cause the notification is already saved to the db
            }
        }
    }
}

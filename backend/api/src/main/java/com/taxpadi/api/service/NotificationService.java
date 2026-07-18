package com.taxpadi.api.service;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.google.firebase.messaging.FirebaseMessaging;
import com.taxpadi.api.dto.common.PaginationInfo;
import com.taxpadi.api.dto.notification.NotificationItem;
import com.taxpadi.api.dto.notification.NotificationListResponse;
import com.taxpadi.api.dto.notification.NotificationPreferences;
import com.taxpadi.api.dto.notification.NotificationPreferencesResponse;
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

    public NotificationListResponse getNotifications(User user, int page, int limit) {
        int safePage = Math.max(0, page - 1);
        int safeLimit = Math.min(limit, 100);

        Page<Notification> results = notificationRepository
            .findAllByUserOrderByCreatedAtDesc(user, PageRequest.of(safePage, safeLimit));

        List<NotificationItem> notifications = results.getContent().stream()
            .map(this::toItem).toList();

        return new NotificationListResponse(
            notifications,
            new PaginationInfo(results.getTotalElements(), page, safeLimit, results.getTotalPages())
        );
    }

    public long getUnreadCount(User user) {
        return notificationRepository.countByUserAndReadFalse(user);
    }

    public NotificationItem getNotification(User user, UUID id) {
        Notification n = notificationRepository.findByNotificationIdAndUser(id, user)
            .orElseThrow(() -> new NotFoundException("Notification not found"));
        return toItem(n);
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

    public NotificationPreferencesResponse getPreferences(User user) {
        return new NotificationPreferencesResponse(toPreferencesDto(user.getNotificationPreferences()));
    }

    @Transactional
    public NotificationPreferencesResponse updatePreferences(User user, NotificationPreferences request) {
        java.util.Map<String, Boolean> prefs = user.getNotificationPreferences();
        if (prefs == null) prefs = new java.util.HashMap<>();
        if (request.getPushNotifications()    != null) prefs.put("push_notifications",    request.getPushNotifications());
        if (request.getEmailNotifications()   != null) prefs.put("email_notifications",   request.getEmailNotifications());
        if (request.getSmsNotifications()     != null) prefs.put("sms_notifications",     request.getSmsNotifications());
        if (request.getDeadlineReminders()    != null) prefs.put("deadline_reminders",    request.getDeadlineReminders());
        if (request.getPenaltyAlerts()        != null) prefs.put("penalty_alerts",        request.getPenaltyAlerts());
        if (request.getVaultSuggestions()     != null) prefs.put("vault_suggestions",     request.getVaultSuggestions());
        if (request.getReferralOffers()       != null) prefs.put("referral_offers",       request.getReferralOffers());
        if (request.getPaymentConfirmations() != null) prefs.put("payment_confirmations", request.getPaymentConfirmations());
        if (request.getSystemUpdates()        != null) prefs.put("system_updates",        request.getSystemUpdates());
        user.setNotificationPreferences(prefs);
        userRepository.save(user);
        return new NotificationPreferencesResponse(toPreferencesDto(prefs));
    }

    private NotificationPreferences toPreferencesDto(java.util.Map<String, Boolean> prefs) {
        NotificationPreferences dto = new NotificationPreferences();
        if (prefs != null) {
            dto.setPushNotifications(prefs.getOrDefault("push_notifications", true));
            dto.setEmailNotifications(prefs.getOrDefault("email_notifications", true));
            dto.setSmsNotifications(prefs.getOrDefault("sms_notifications", false));
            dto.setDeadlineReminders(prefs.getOrDefault("deadline_reminders", true));
            dto.setPenaltyAlerts(prefs.getOrDefault("penalty_alerts", true));
            dto.setVaultSuggestions(prefs.getOrDefault("vault_suggestions", true));
            dto.setReferralOffers(prefs.getOrDefault("referral_offers", true));
            dto.setPaymentConfirmations(prefs.getOrDefault("payment_confirmations", true));
            dto.setSystemUpdates(prefs.getOrDefault("system_updates", true));
        }
        return dto;
    }

    public void send(User user, String title, String body, NotificationType type, String actionUrl) {
        java.util.Map<String, Boolean> prefs = user.getNotificationPreferences();
        if (prefs != null && Boolean.FALSE.equals(prefs.get(preferenceKey(type)))) return;

        Notification n = new Notification();
        n.setUser(user);
        n.setTitle(title);
        n.setBody(body);
        n.setType(type);
        n.setActionUrl(actionUrl);
        notificationRepository.save(n);

        boolean pushEnabled = prefs == null || !Boolean.FALSE.equals(prefs.get("push_notifications"));
        if (!pushEnabled) return;

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
                // don't fail if push delivery fails — notification is already saved to the db
            }
        }
    }

    @Transactional
    public void sendBroadcast(String title, String body, NotificationType type, String actionUrl) {
        notificationRepository.broadcastToAllActiveUsers(title, body, type.name(), actionUrl);
    }

    private String preferenceKey(NotificationType type) {
        return switch (type) {
            case DEADLINE -> "deadline_reminders";
            case PENALTY  -> "penalty_alerts";
            case VAULT    -> "vault_suggestions";
            case REFERRAL -> "referral_offers";
            case PAYMENT  -> "payment_confirmations";
            case SYSTEM   -> "system_updates";
        };
    }

    private NotificationItem toItem(Notification n) {
        NotificationItem item = new NotificationItem();
        item.setNotificationId(n.getNotificationId());
        item.setTitle(n.getTitle());
        item.setBody(n.getBody());
        item.setType(n.getType());
        item.setRead(n.getRead());
        item.setActionUrl(n.getActionUrl());
        item.setCreatedAt(n.getCreatedAt());
        return item;
    }
}

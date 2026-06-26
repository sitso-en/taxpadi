package com.taxpadi.api.controller;

import com.taxpadi.api.common.ApiResponse;
import com.taxpadi.api.dto.notification.NotificationItem;
import com.taxpadi.api.dto.notification.NotificationListResponse;
import com.taxpadi.api.dto.notification.NotificationPreferences;
import com.taxpadi.api.dto.notification.NotificationPreferencesResponse;
import com.taxpadi.api.dto.notification.RegisterFcmRequest;
import com.taxpadi.api.dto.notification.UnreadCountResponse;
import com.taxpadi.api.dto.notification.UnregisterFcmRequest;
import com.taxpadi.api.model.User;
import com.taxpadi.api.security.TaxPadiUserDetails;
import com.taxpadi.api.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> register(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @RequestBody RegisterFcmRequest request) {
        User user = userDetails.getUser();
        notificationService.registerFcmToken(user, request.getFcmToken(), request.getDeviceInfo(), request.getPlatform());
        return ResponseEntity.ok(new ApiResponse<>(true, null, "Device registered for notifications."));
    }

    @DeleteMapping("/register")
    public ResponseEntity<ApiResponse<Void>> unregister(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @RequestBody UnregisterFcmRequest request) {
        User user = userDetails.getUser();
        notificationService.unregisterFcmToken(user, request.getFcmToken());
        return ResponseEntity.ok(new ApiResponse<>(true, null, "Device unregistered from notifications."));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<NotificationListResponse>> getNotifications(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            notificationService.getNotifications(user, page, limit),
            "Notifications retrieved successfully."));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<UnreadCountResponse>> getUnreadCount(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            new UnreadCountResponse(notificationService.getUnreadCount(user)),
            "Unread count retrieved successfully."));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NotificationItem>> getNotification(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @PathVariable UUID id) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            notificationService.getNotification(user, id),
            "Notification retrieved successfully."));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @PathVariable UUID id) {
        User user = userDetails.getUser();
        notificationService.markAsRead(user, id);
        return ResponseEntity.ok(new ApiResponse<>(true, null, "Notification marked as read."));
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails) {
        User user = userDetails.getUser();
        notificationService.markAllAsRead(user);
        return ResponseEntity.ok(new ApiResponse<>(true, null, "All notifications marked as read."));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @PathVariable UUID id) {
        User user = userDetails.getUser();
        notificationService.deleteNotification(user, id);
        return ResponseEntity.ok(new ApiResponse<>(true, null, "Notification deleted."));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> clearAll(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails) {
        User user = userDetails.getUser();
        notificationService.clearAll(user);
        return ResponseEntity.ok(new ApiResponse<>(true, null, "All notifications cleared."));
    }

    @GetMapping("/preferences")
    public ResponseEntity<ApiResponse<NotificationPreferencesResponse>> getPreferences(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            notificationService.getPreferences(user),
            "Notification preferences retrieved successfully."));
    }

    @PutMapping("/preferences")
    public ResponseEntity<ApiResponse<NotificationPreferencesResponse>> updatePreferences(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @RequestBody NotificationPreferences prefs) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            notificationService.updatePreferences(user, prefs),
            "Notification preferences updated successfully."));
    }
}

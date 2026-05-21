package com.taxpadi.api.controller;

import java.util.Map;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.taxpadi.api.common.ApiResponse;
import com.taxpadi.api.model.User;
import com.taxpadi.api.security.TaxPadiUserDetails;
import com.taxpadi.api.service.NotificationService;

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
            @RequestBody Map<String, String> body) {
        User user = userDetails.getUser();
        notificationService.registerFcmToken(
            user,
            body.get("fcm_token"),
            body.get("device_info"),
            body.get("platform")
        );
        return ResponseEntity.ok(new ApiResponse<>(true, null, "Device registered for notifications."));
    }

    @DeleteMapping("/register")
    public ResponseEntity<ApiResponse<Void>> unregister(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @RequestBody Map<String, String> body) {
        User user = userDetails.getUser();
        notificationService.unregisterFcmToken(user, body.get("fcm_token"));
        return ResponseEntity.ok(new ApiResponse<>(true, null, "Device unregistered from notifications."));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getNotifications(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            notificationService.getNotifications(user, page, limit),
            "Notifications retrieved successfully."));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails) {
        User user = userDetails.getUser();
        long count = notificationService.getUnreadCount(user);
        return ResponseEntity.ok(new ApiResponse<>(true,
            Map.of("unread_count", count),
            "Unread count retrieved successfully."));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getNotification(
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
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> getPreferences(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            notificationService.getPreferences(user),
            "Notification preferences retrieved successfully."));
    }

    @PutMapping("/preferences")
    public ResponseEntity<ApiResponse<Void>> updatePreferences(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @RequestBody Map<String, Boolean> prefs) {
        User user = userDetails.getUser();
        notificationService.updatePreferences(user, prefs);
        return ResponseEntity.ok(new ApiResponse<>(true, null, "Notification preferences updated successfully."));
    }
}

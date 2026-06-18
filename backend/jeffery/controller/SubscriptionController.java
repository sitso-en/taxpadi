package com.taxpadi.jeffery.controller;

import com.taxpadi.jeffery.service.SubscriptionService;
import com.taxpadi.jeffery.service.SubscriptionService.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/subscriptions")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    public SubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    // GET /api/v1/subscriptions/status
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus(@RequestParam String userId) {
        Map<String, Object> data = subscriptionService.getStatus(userId);
        return ResponseEntity.ok(buildResponse(true, data,
                "Subscription status retrieved successfully."));
    }

    // POST /api/v1/subscriptions/subscribe
    @PostMapping("/subscribe")
    public ResponseEntity<Map<String, Object>> subscribe(
            @RequestParam String userId,
            @RequestBody Map<String, Object> request) {
        Map<String, Object> data = subscriptionService.subscribe(userId, request);
        return ResponseEntity.ok(buildResponse(true, data,
                "Subscription payment initiated. Please approve the payment on your phone."));
    }

    // POST /api/v1/subscriptions/cancel
    @PostMapping("/cancel")
    public ResponseEntity<Map<String, Object>> cancel(
            @RequestParam String userId,
            @RequestBody(required = false) Map<String, Object> request) {
        String reason = request != null ? (String) request.get("reason") : null;
        Map<String, Object> data = subscriptionService.cancel(userId, reason);
        return ResponseEntity.ok(buildResponse(true, data,
                "Subscription cancelled. You will retain paid access until your current period ends."));
    }

    // Exception handlers
    @ExceptionHandler(AlreadySubscribedException.class)
    public ResponseEntity<Map<String, Object>> handleAlreadySubscribed(AlreadySubscribedException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(buildError("ALREADY_SUBSCRIBED", ex.getMessage()));
    }

    @ExceptionHandler(NoActiveSubscriptionException.class)
    public ResponseEntity<Map<String, Object>> handleNoSubscription(NoActiveSubscriptionException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(buildError("NO_ACTIVE_SUBSCRIPTION", ex.getMessage()));
    }

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(ValidationException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(buildError("VALIDATION_ERROR", ex.getMessage()));
    }

    private Map<String, Object> buildResponse(boolean success, Object data, String message) {
        Map<String, Object> r = new HashMap<>();
        r.put("success", success);
        r.put("data", data);
        r.put("message", message);
        r.put("timestamp", LocalDateTime.now());
        return r;
    }

    private Map<String, Object> buildError(String code, String message) {
        Map<String, Object> r = new HashMap<>();
        r.put("success", false);
        r.put("code", code);
        r.put("message", message);
        r.put("timestamp", LocalDateTime.now());
        return r;
    }
}
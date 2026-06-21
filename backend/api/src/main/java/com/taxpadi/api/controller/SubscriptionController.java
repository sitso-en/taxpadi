package com.taxpadi.api.controller;

import com.taxpadi.api.common.ApiResponse;
import com.taxpadi.api.dto.subscription.CancelSubscriptionRequest;
import com.taxpadi.api.dto.subscription.CancelSubscriptionResponse;
import com.taxpadi.api.dto.subscription.SubscribeRequest;
import com.taxpadi.api.dto.subscription.SubscribeResponse;
import com.taxpadi.api.dto.subscription.SubscriptionStatusDto;
import com.taxpadi.api.model.User;
import com.taxpadi.api.security.TaxPadiUserDetails;
import com.taxpadi.api.service.SubscriptionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/subscriptions")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    public SubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @GetMapping("/plans")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getPlans() {
        List<Map<String, Object>> plans = subscriptionService.getPlans();
        return ResponseEntity.ok(new ApiResponse<>(true, plans, "Subscription plans retrieved successfully."));
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<SubscriptionStatusDto>> getStatus(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails) {
        User user = userDetails.getUser();
        SubscriptionStatusDto data = subscriptionService.getStatus(user);
        return ResponseEntity.ok(new ApiResponse<>(true, data,
                "Subscription status retrieved successfully."));
    }

    @PostMapping("/subscribe")
    public ResponseEntity<ApiResponse<SubscribeResponse>> subscribe(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @RequestBody SubscribeRequest request) {
        User user = userDetails.getUser();
        SubscribeResponse data = subscriptionService.subscribe(user, request);
        return ResponseEntity.ok(new ApiResponse<>(true, data,
                "Subscription payment initiated. Please approve the payment on your phone."));
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<SubscribeResponse>> verify(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails) {
        User user = userDetails.getUser();
        SubscribeResponse data = subscriptionService.verify(user);
        return ResponseEntity.ok(new ApiResponse<>(true, data,
                "Subscription activated successfully."));
    }

    @PostMapping("/cancel")
    public ResponseEntity<ApiResponse<CancelSubscriptionResponse>> cancel(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @RequestBody(required = false) CancelSubscriptionRequest request) {
        User user = userDetails.getUser();
        String reason = request != null ? request.getReason() : null;
        CancelSubscriptionResponse data = subscriptionService.cancel(user, reason);
        return ResponseEntity.ok(new ApiResponse<>(true, data,
                "Subscription cancelled. You will retain paid access until your current period ends."));
    }
}

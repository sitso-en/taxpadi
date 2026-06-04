package com.taxpadi.api.controller;

import java.util.Map;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
import com.taxpadi.api.service.ReferralService;

@RestController
@RequestMapping("/api/v1/referrals")
public class ReferralController {

    private final ReferralService referralService;

    public ReferralController(ReferralService referralService) {
        this.referralService = referralService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOffers(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @RequestParam(required = false) String offer_type,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            referralService.getOffers(user, offer_type, page, limit),
            "Referral offers retrieved successfully."));
    }

    @PostMapping("/check-eligibility")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkEligibility(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            referralService.checkEligibility(user),
            "Eligibility check complete."));
    }

    @PutMapping("/{id}/viewed")
    public ResponseEntity<ApiResponse<Map<String, Object>>> markViewed(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @PathVariable UUID id) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            referralService.markViewed(user, id),
            "Offer marked as viewed."));
    }

    @PutMapping("/{id}/clicked")
    public ResponseEntity<ApiResponse<Map<String, Object>>> markClicked(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @PathVariable UUID id) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            referralService.markClicked(user, id),
            "Redirecting to partner."));
    }

    @PutMapping("/{id}/dismiss")
    public ResponseEntity<ApiResponse<Map<String, Object>>> dismiss(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @PathVariable UUID id) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            referralService.dismiss(user, id),
            "Offer dismissed."));
    }

    @PostMapping("/{id}/converted")
    public ResponseEntity<ApiResponse<Map<String, Object>>> markConverted(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(new ApiResponse<>(true,
            referralService.markConverted(id, body),
            "Conversion confirmed."));
    }
}

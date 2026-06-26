package com.taxpadi.api.controller;

import com.taxpadi.api.common.ApiResponse;
import com.taxpadi.api.dto.referral.*;
import com.taxpadi.api.model.User;
import com.taxpadi.api.security.TaxPadiUserDetails;
import com.taxpadi.api.service.ReferralService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/referrals")
public class ReferralController {

    private final ReferralService referralService;

    public ReferralController(ReferralService referralService) {
        this.referralService = referralService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<ReferralListResponse>> getOffers(
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
    public ResponseEntity<ApiResponse<EligibilityResponse>> checkEligibility(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            referralService.checkEligibility(user),
            "Eligibility check complete."));
    }

    @PutMapping("/{id}/viewed")
    public ResponseEntity<ApiResponse<OfferStatusResponse>> markViewed(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @PathVariable UUID id) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            referralService.markViewed(user, id),
            "Offer marked as viewed."));
    }

    @PutMapping("/{id}/clicked")
    public ResponseEntity<ApiResponse<ClickedOfferResponse>> markClicked(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @PathVariable UUID id) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            referralService.markClicked(user, id),
            "Redirecting to partner."));
    }

    @PutMapping("/{id}/dismiss")
    public ResponseEntity<ApiResponse<OfferStatusResponse>> dismiss(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @PathVariable UUID id) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            referralService.dismiss(user, id),
            "Offer dismissed."));
    }

    @PostMapping("/{id}/converted")
    public ResponseEntity<ApiResponse<ConvertedOfferResponse>> markConverted(
            @PathVariable UUID id,
            @RequestBody MarkConvertedRequest request,
            @RequestHeader(value = "X-Partner-Api-Key", required = false) String apiKey) {
        return ResponseEntity.ok(new ApiResponse<>(true,
            referralService.markConverted(id, request, apiKey),
            "Conversion confirmed."));
    }
}

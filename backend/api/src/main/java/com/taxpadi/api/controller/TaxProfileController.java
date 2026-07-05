package com.taxpadi.api.controller;

import com.taxpadi.api.common.ApiResponse;
import com.taxpadi.api.dto.taxprofile.CompleteOnboardingRequest;
import com.taxpadi.api.dto.taxprofile.CompleteOnboardingResponse;
import com.taxpadi.api.dto.taxprofile.TaxProfileDto;
import com.taxpadi.api.dto.taxprofile.UpdateTaxProfileRequest;
import com.taxpadi.api.dto.taxprofile.UpdateTaxProfileResponse;
import com.taxpadi.api.model.User;
import com.taxpadi.api.security.TaxPadiUserDetails;
import com.taxpadi.api.service.TaxProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/tax-profile")
public class TaxProfileController {

    private final TaxProfileService taxProfileService;

    public TaxProfileController(TaxProfileService taxProfileService) {
        this.taxProfileService = taxProfileService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<TaxProfileDto>> getProfile(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails) {
        User user = userDetails.getUser();
        TaxProfileDto data = taxProfileService.getProfile(user);
        return ResponseEntity.ok(new ApiResponse<>(true, data,
                "Tax profile retrieved successfully."));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<UpdateTaxProfileResponse>> updateProfile(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @Valid @RequestBody UpdateTaxProfileRequest request) {
        User user = userDetails.getUser();
        UpdateTaxProfileResponse data = taxProfileService.updateProfile(user, request);
        return ResponseEntity.ok(new ApiResponse<>(true, data,
                "Tax profile updated successfully."));
    }

    @PostMapping("/complete-onboarding")
    public ResponseEntity<ApiResponse<CompleteOnboardingResponse>> completeOnboarding(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @Valid @RequestBody CompleteOnboardingRequest request) {
        User user = userDetails.getUser();
        CompleteOnboardingResponse data = taxProfileService.completeOnboarding(user, request);
        return ResponseEntity.ok(new ApiResponse<>(true, data,
                "Onboarding complete. Your tax deadlines have been generated."));
    }
}

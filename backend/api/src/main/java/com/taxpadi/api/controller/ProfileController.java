package com.taxpadi.api.controller;

import com.taxpadi.api.common.ApiResponse;
import com.taxpadi.api.dto.profile.*;
import com.taxpadi.api.model.User;
import com.taxpadi.api.security.TaxPadiUserDetails;
import com.taxpadi.api.service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/profiles")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<ProfileListResponse>> getProfiles(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            profileService.getProfiles(user),
            "Profiles retrieved successfully."));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CreateProfileResponse>> createProfile(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @Valid @RequestBody CreateProfileRequest request) {
        User user = userDetails.getUser();
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(new ApiResponse<>(true,
                profileService.createProfile(user, request),
                "New profile created successfully."));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UpdateProfileResponse>> updateProfile(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @PathVariable UUID id,
            @RequestBody UpdateProfileRequest request) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            profileService.updateProfile(user, id, request),
            "Profile updated successfully."));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProfile(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @PathVariable UUID id) {
        User user = userDetails.getUser();
        profileService.deleteProfile(user, id);
        return ResponseEntity.ok(new ApiResponse<>(true, null, "Profile deleted successfully."));
    }

    @PutMapping("/{id}/switch")
    public ResponseEntity<ApiResponse<SwitchProfileResponse>> switchProfile(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @PathVariable UUID id) {
        User user = userDetails.getUser();
        return ResponseEntity.ok(new ApiResponse<>(true,
            profileService.switchProfile(user, id),
            "Active profile switched successfully."));
    }
}

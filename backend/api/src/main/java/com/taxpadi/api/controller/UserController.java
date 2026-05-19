package com.taxpadi.api.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import com.taxpadi.api.common.ApiResponse;
import com.taxpadi.api.dto.user.ChangePasswordRequest;
import com.taxpadi.api.dto.user.DataRequestResponse;
import com.taxpadi.api.dto.user.DeactivateAccountRequest;
import com.taxpadi.api.dto.user.HealthScoreResponse;
import com.taxpadi.api.dto.user.PermanentDeleteRequest;
import com.taxpadi.api.dto.user.RevokeAllSessionsResponse;
import com.taxpadi.api.dto.user.RevokeSessionResponse;
import com.taxpadi.api.dto.user.SessionsResponse;
import com.taxpadi.api.dto.user.UpdateProfileRequest;
import com.taxpadi.api.dto.user.UpdateProfileResponse;
import com.taxpadi.api.dto.user.UserProfileResponse;
import com.taxpadi.api.security.TaxPadiUserDetails;
import com.taxpadi.api.service.JwtService;
import com.taxpadi.api.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;


@RestController
@RequestMapping("/api/v1/users")
public class UserController {
    private final UserService userService;

    private final JwtService jwtService;


    public UserController(UserService userService, JwtService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }

    private UUID extractCurrentTokenId(HttpServletRequest request){
        String header = request.getHeader("Authorization");
        String token = header.substring(7);
        return UUID.fromString(jwtService.validateToken(token).getId());
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails) {
        return ResponseEntity.ok(new ApiResponse<>(true,
            userService.getProfile(userDetails.getUser()),
            "User profile retrieved successfully."));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UpdateProfileResponse>> updateProfile(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @RequestBody @Valid UpdateProfileRequest request,
            HttpServletRequest httpRequest) {
        return ResponseEntity.ok(new ApiResponse<>(true,
            userService.updateProfile(userDetails.getUser(), request, httpRequest.getRemoteAddr()),
            "Profile updated successfully."));
    }

    @PutMapping("/me/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @RequestBody @Valid ChangePasswordRequest request,
            HttpServletRequest httpRequest) {
        userService.changePassword(userDetails.getUser(), request, extractCurrentTokenId(httpRequest), httpRequest.getRemoteAddr());
        return ResponseEntity.ok(new ApiResponse<>(true, null,
            "Password changed successfully. All other sessions have been logged out."));
    }

    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse<Void>> deactivateAccount(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @RequestBody @Valid DeactivateAccountRequest request,
            HttpServletRequest httpRequest) {
        userService.deactivateAccount(userDetails.getUser(), request, httpRequest.getRemoteAddr());
        return ResponseEntity.ok(new ApiResponse<>(true, null,
            "Your account has been deactivated. Your data will be retained for 6 years in compliance with GRA audit requirements."));
    }

    @GetMapping("/me/health-score")
    public ResponseEntity<ApiResponse<HealthScoreResponse>> getHealthScore(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails) {
        return ResponseEntity.ok(new ApiResponse<>(true,
            userService.getHealthScore(userDetails.getUser()),
            "Business Health Score retrieved successfully."));
    }

    @PostMapping("/me/data-request")
    public ResponseEntity<ApiResponse<DataRequestResponse>> requestData(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails) {
        return ResponseEntity.ok(new ApiResponse<>(true,
            userService.requestData(userDetails.getUser()),
            "Data request submitted."));
    }

    @GetMapping("/me/sessions")
    public ResponseEntity<ApiResponse<SessionsResponse>> getSessions(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            HttpServletRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true,
            userService.getSessions(userDetails.getUser(), extractCurrentTokenId(request)),
            "Active sessions retrieved successfully."));
    }

    @DeleteMapping("/me/sessions/{tokenId}")
    public ResponseEntity<ApiResponse<RevokeSessionResponse>> revokeSession(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @PathVariable UUID tokenId,
            HttpServletRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true,
            userService.revokeSession(userDetails.getUser(), tokenId, extractCurrentTokenId(request)),
            "Session revoked successfully. The device has been logged out."));
    }

    @DeleteMapping("/me/sessions")
    public ResponseEntity<ApiResponse<RevokeAllSessionsResponse>> revokeAllSessions(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            HttpServletRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true,
            userService.revokeAllSessions(userDetails.getUser(), extractCurrentTokenId(request)),
            "All other sessions have been revoked. Only your current session remains active."));
    }

    @DeleteMapping("/me/permanent")
    public ResponseEntity<ApiResponse<Void>> permanentDelete(
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            @RequestBody @Valid PermanentDeleteRequest request) {
        userService.permanentDelete(userDetails.getUser(), request);
        return ResponseEntity.ok(new ApiResponse<>(true, null,
            "Your account and all associated data have been permanently deleted."));
    }
}

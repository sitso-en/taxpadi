package com.taxpadi.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taxpadi.api.common.ApiResponse;
import com.taxpadi.api.dto.auth.BiometricLoginRequest;
import com.taxpadi.api.dto.auth.BiometricLoginResponse;
import com.taxpadi.api.dto.auth.ForgotPasswordRequest;
import com.taxpadi.api.dto.auth.LoginRequest;
import com.taxpadi.api.dto.auth.LoginResponse;
import com.taxpadi.api.dto.auth.LogoutResponse;
import com.taxpadi.api.dto.auth.RefreshTokenRequest;
import com.taxpadi.api.dto.auth.RefreshTokenResponse;
import com.taxpadi.api.dto.auth.RegisterBiometricRequest;
import com.taxpadi.api.dto.auth.RegisterBiometricResponse;
import com.taxpadi.api.dto.auth.RegisterRequest;
import com.taxpadi.api.dto.auth.RegisterResponse;
import com.taxpadi.api.dto.auth.ResendOtpRequest;
import com.taxpadi.api.dto.auth.ResendOtpResponse;
import com.taxpadi.api.dto.auth.ResetPasswordRequest;
import com.taxpadi.api.dto.auth.VerifyOtpRequest;
import com.taxpadi.api.dto.auth.VerifyOtpResponse;
import com.taxpadi.api.dto.auth.VerifyResetOtpRequest;
import com.taxpadi.api.dto.auth.VerifyResetOtpResponse;
import com.taxpadi.api.security.TaxPadiUserDetails;
import com.taxpadi.api.service.AuthService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService){
        this.authService=authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<RegisterResponse>> register(@RequestBody @Valid RegisterRequest request) {
        RegisterResponse data = authService.register(request);
        return ResponseEntity.status(201)
                .body(new ApiResponse<>(true, data, "Registration successful. Please verify your phone number"));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<VerifyOtpResponse>> verifyOtp(@RequestBody @Valid VerifyOtpRequest request) {
        VerifyOtpResponse data = authService.verifyOtp(request);
        return ResponseEntity.ok(new ApiResponse<>(true, data, "OTP verified successfully"));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse<ResendOtpResponse>> resendOtp(@RequestBody @Valid ResendOtpRequest request) {
        ResendOtpResponse data = authService.resendOtp(request);
        return ResponseEntity.ok(new ApiResponse<>(true, data, "OTP resent successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@RequestBody @Valid LoginRequest request,
            HttpServletRequest httpRequest) {
        LoginResponse data = authService.login(request, httpRequest.getRemoteAddr());
        return ResponseEntity.ok(new ApiResponse<>(true, data, "Login successful"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<RefreshTokenResponse>> refresh(@RequestBody @Valid RefreshTokenRequest request) {
        RefreshTokenResponse data = authService.refreshToken(request);
        return ResponseEntity.ok(new ApiResponse<>(true, data, "Token refreshed successfully"));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<LogoutResponse>> logout(@RequestBody @Valid RefreshTokenRequest request,
            HttpServletRequest httpRequest) {
        LogoutResponse data = authService.logout(request, httpRequest.getRemoteAddr());
        return ResponseEntity.ok(new ApiResponse<>(true, data, "Logged out successfully"));
    }

    @PostMapping("/biometric/register")
    public ResponseEntity<ApiResponse<RegisterBiometricResponse>> registerBiometric(
            @RequestBody @Valid RegisterBiometricRequest request,
            @AuthenticationPrincipal TaxPadiUserDetails userDetails,
            HttpServletRequest httpRequest) {
        RegisterBiometricResponse data = authService.registerBiometric(request, userDetails.getUser(), httpRequest.getRemoteAddr());
        return ResponseEntity.ok(new ApiResponse<>(true, data, "Biometric registered successfully"));
    }

    @PostMapping("/biometric/login")
    public ResponseEntity<ApiResponse<BiometricLoginResponse>> biometricLogin(
            @RequestBody @Valid BiometricLoginRequest request,
            HttpServletRequest httpRequest) {
        BiometricLoginResponse data = authService.biometricLogin(request, httpRequest.getRemoteAddr());
        return ResponseEntity.ok(new ApiResponse<>(true, data, "Biometric login successful"));
    }


    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @RequestBody @Valid ForgotPasswordRequest request) {
        authService.forgotPassword(request.getPhone());
        return ResponseEntity.ok(new ApiResponse<>(true, null, "If this number is registered you will receive an OTP shortly"));
    }


    @PostMapping("/verify-reset-otp")
    public ResponseEntity<ApiResponse<VerifyResetOtpResponse>> verifyResetOtp(
            @RequestBody @Valid VerifyResetOtpRequest request) {
        VerifyResetOtpResponse data = authService.verifyResetOtp(request.getPhone(), request.getOtpCode());
        return ResponseEntity.ok(new ApiResponse<>(true, data, "OTP verified. You may now reset your password."));
    }


    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @RequestBody @Valid ResetPasswordRequest request,
            HttpServletRequest httpRequest) {
        authService.resetPassword(request.getResetToken(), request.getNewPassword(), request.getConfirmPassword(), httpRequest.getRemoteAddr());
        return ResponseEntity.ok(new ApiResponse<>(true, null, "Password reset successfully. Please log in with your new password."));
    }
    
}

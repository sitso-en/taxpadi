package com.taxpadi.api.dto.auth;

import com.fasterxml.jackson.annotation.JsonProperty;

public class LoginResponse {

    @JsonProperty("access_token")
    private String accessToken;

    @JsonProperty("refresh_token")
    private String refreshToken;

    @JsonProperty("token_type")
    private String tokenType;

    @JsonProperty("expires_in")
    private Integer expiresIn;

    @JsonProperty("requires_otp")
    private Boolean requiresOtp;

    private UserSummary user;

    public LoginResponse(String accessToken, String refreshToken, String tokenType, Integer expiresIn, Boolean requiresOtp, UserSummary user) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.tokenType = tokenType;
        this.expiresIn = expiresIn;
        this.requiresOtp = requiresOtp;
        this.user = user;
    }

    
    // --- Getters and Setters---
    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }

    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }

    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }

    public Integer getExpiresIn() { return expiresIn; }
    public void setExpiresIn(Integer expiresIn) { this.expiresIn = expiresIn; }

    public Boolean getRequiresOtp() { return requiresOtp; }
    public void setRequiresOtp(Boolean requiresOtp) { this.requiresOtp = requiresOtp; }

    public UserSummary getUser() { return user; }
    public void setUser(UserSummary user) { this.user = user; }
}
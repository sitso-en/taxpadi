package com.taxpadi.api.dto.auth;

import com.fasterxml.jackson.annotation.JsonProperty;

public class BiometricLoginResponse {

    @JsonProperty("access_token")
    private String accessToken;

    @JsonProperty("refresh_token")
    private String refreshToken;

    @JsonProperty("token_type")
    private String tokenType;

    @JsonProperty("expires_in")
    private Integer expiresIn;

    private UserSummary user;

    public BiometricLoginResponse(String accessToken, String refreshToken, String tokenType, Integer expiresIn, UserSummary user) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.tokenType = tokenType;
        this.expiresIn = expiresIn;
        this.user = user;
    }


    // --- Getters and Setters for BiometricLoginResponse ---
    
    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }

    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }

    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }

    public Integer getExpiresIn() { return expiresIn; }
    public void setExpiresIn(Integer expiresIn) { this.expiresIn = expiresIn; }

    public UserSummary getUser() { return user; }
    public void setUser(UserSummary user) { this.user = user; }
}
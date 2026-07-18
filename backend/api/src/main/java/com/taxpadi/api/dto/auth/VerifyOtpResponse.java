package com.taxpadi.api.dto.auth;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.taxpadi.api.model.OtpPurpose;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class VerifyOtpResponse {

    private Boolean verified;
    private OtpPurpose purpose;

    @JsonProperty("access_token")
    private String accessToken;

    @JsonProperty("refresh_token")
    private String refreshToken;

    @JsonProperty("token_type")
    private String tokenType;

    @JsonProperty("expires_in")
    private Integer expiresIn;

    private UserSummary user;

    /** Used for non-REGISTER purposes (no session created). */
    public VerifyOtpResponse(Boolean verified, OtpPurpose purpose) {
        this.verified = verified;
        this.purpose = purpose;
    }

    /** Used for REGISTER — includes auto-login session. */
    public VerifyOtpResponse(Boolean verified, OtpPurpose purpose,
                             String accessToken, String refreshToken,
                             String tokenType, Integer expiresIn, UserSummary user) {
        this.verified = verified;
        this.purpose = purpose;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.tokenType = tokenType;
        this.expiresIn = expiresIn;
        this.user = user;
    }


    // --- Getters and Setters ---

    public Boolean getVerified() { return verified; }
    public void setVerified(Boolean verified) { this.verified = verified; }

    public OtpPurpose getPurpose() { return purpose; }
    public void setPurpose(OtpPurpose purpose) { this.purpose = purpose; }

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
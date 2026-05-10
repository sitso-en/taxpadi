package com.taxpadi.api.dto.auth;

import com.fasterxml.jackson.annotation.JsonProperty;

public class VerifyResetOtpResponse {

    @JsonProperty("reset_token")
    private String resetToken;

    @JsonProperty("expires_in_minutes")
    private int expiresInMinutes = 15;


    public VerifyResetOtpResponse(String resetToken, int expiresInMinutes) {
        this.resetToken = resetToken;
        this.expiresInMinutes = expiresInMinutes;
    }

    public String getResetToken() {
        return resetToken;
    }

    public void setResetToken(String resetToken) {
        this.resetToken = resetToken;
    }

    public int getExpiresInMinutes() {
        return expiresInMinutes;
    }

    public void setExpiresInMinutes(int expiresInMinutes) {
        this.expiresInMinutes = expiresInMinutes;
    }

}

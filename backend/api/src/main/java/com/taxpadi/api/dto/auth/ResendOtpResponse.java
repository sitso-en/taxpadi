package com.taxpadi.api.dto.auth;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ResendOtpResponse {

    private String phone;

    @JsonProperty("expires_in_minutes")
    private Integer expiresInMinutes;

    public ResendOtpResponse(String phone, Integer expiresInMinutes) {
        this.phone = phone;
        this.expiresInMinutes = expiresInMinutes;
    }

    // --- Getters and Setters ---

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Integer getExpiresInMinutes() {
        return expiresInMinutes;
    }

    public void setExpiresInMinutes(Integer expiresInMinutes) {
        this.expiresInMinutes = expiresInMinutes;
    }
}
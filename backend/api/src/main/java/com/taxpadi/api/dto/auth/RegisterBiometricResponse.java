package com.taxpadi.api.dto.auth;

import com.fasterxml.jackson.annotation.JsonProperty;

public class RegisterBiometricResponse {

    @JsonProperty("biometric_enabled")
    private Boolean biometricEnabled;

    @JsonProperty("device_info")
    private String deviceInfo;

    public RegisterBiometricResponse(Boolean biometricEnabled, String deviceInfo) {
        this.biometricEnabled = biometricEnabled;
        this.deviceInfo = deviceInfo;
    }

    // --- Getters and Setters ---

    public Boolean getBiometricEnabled() {
        return biometricEnabled;
    }

    public void setBiometricEnabled(Boolean biometricEnabled) {
        this.biometricEnabled = biometricEnabled;
    }

    public String getDeviceInfo() {
        return deviceInfo;
    }

    public void setDeviceInfo(String deviceInfo) {
        this.deviceInfo = deviceInfo;
    }
}
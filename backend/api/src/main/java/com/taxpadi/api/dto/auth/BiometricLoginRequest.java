package com.taxpadi.api.dto.auth;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

public class BiometricLoginRequest {

    @NotBlank(message = "Biometric token is required")
    @JsonProperty("biometric_token")
    private String biometricToken;

    @NotBlank(message = "Device info is required")
    @JsonProperty("device_info")
    private String deviceInfo;

    // --- Getters and Setters ---

    public String getBiometricToken() {
        return biometricToken;
    }

    public void setBiometricToken(String biometricToken) {
        this.biometricToken = biometricToken;
    }

    public String getDeviceInfo() {
        return deviceInfo;
    }

    public void setDeviceInfo(String deviceInfo) {
        this.deviceInfo = deviceInfo;
    }
}
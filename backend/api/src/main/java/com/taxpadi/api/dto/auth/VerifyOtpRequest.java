package com.taxpadi.api.dto.auth;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.taxpadi.api.model.OtpPurpose;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class VerifyOtpRequest {

    @NotBlank(message = "Phone number is required")
    private String phone;

    @NotBlank(message = "You cannot proceed without an (One-Time Password)OTP code")
    @JsonProperty("otp_code"
        
    )
    private String otpCode;

    @NotNull(message = "You need to select a purpose for the OTP")
    private OtpPurpose purpose;

    @JsonProperty("device_info")
    private String deviceInfo;


    // --- Getters and Setters ---

    public String getPhone() {
        return phone;
    }
    public void setPhone(String phone) {
        this.phone = phone;
    }


    public String getOtpCode() {
        return otpCode;
    }
    public void setOtpCode(String otpCode) {
        this.otpCode = otpCode;
    }


    public OtpPurpose getPurpose() {
        return purpose;
    }
    public void setPurpose(OtpPurpose purpose) {
        this.purpose = purpose;
    }

    public String getDeviceInfo() {
        return deviceInfo;
    }
    public void setDeviceInfo(String deviceInfo) {
        this.deviceInfo = deviceInfo;
    }
}
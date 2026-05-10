package com.taxpadi.api.dto.auth;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;

public class VerifyResetOtpRequest {
    @NotBlank(message = "Phone number is required")
    private String phone;

    @JsonProperty("otp_code")
    @NotBlank(message = "OTP Code is required")
    private String otpCode;


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
}

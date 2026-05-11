package com.taxpadi.api.dto.auth;

import com.taxpadi.api.model.OtpPurpose;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ResendOtpRequest {

    @NotBlank(message = "Phone number is required")
    private String phone;

    @NotNull(message = "Purpose is required")
    private OtpPurpose purpose;


    
    // --- Getters and Setters ---

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public OtpPurpose getPurpose() {
        return purpose;
    }

    public void setPurpose(OtpPurpose purpose) {
        this.purpose = purpose;
    }
}
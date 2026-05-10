package com.taxpadi.api.dto.auth;

import com.taxpadi.api.model.OtpPurpose;

public class VerifyOtpResponse {
    
    private Boolean verified;
    private OtpPurpose purpose;

    public VerifyOtpResponse(Boolean verified, OtpPurpose purpose) {
        this.verified = verified;
        this.purpose = purpose;
    }

    
    // --- Getters and Setters ---

    public Boolean getVerified() {
        return verified;
    }
    public void setVerified(Boolean verified) {
        this.verified = verified;
    }


    public OtpPurpose getPurpose() {
        return purpose;
    }
    public void setPurpose(OtpPurpose purpose) {
        this.purpose = purpose;
    }
}
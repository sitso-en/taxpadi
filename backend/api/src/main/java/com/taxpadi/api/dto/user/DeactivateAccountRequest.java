package com.taxpadi.api.dto.user;

import jakarta.validation.constraints.NotBlank;

public class DeactivateAccountRequest {

    @NotBlank(message = "Password is required to deactivate your account")
    private String password;

    private String reason;


    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
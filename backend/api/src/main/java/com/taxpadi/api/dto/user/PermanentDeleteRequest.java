package com.taxpadi.api.dto.user;

import jakarta.validation.constraints.NotBlank;

public class PermanentDeleteRequest {

    @NotBlank(message = "Password is required")
    private String password;

    @NotBlank(message = "Confirmation is required")
    private String confirmation;

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getConfirmation() {
        return confirmation;
    }

    public void setConfirmation(String confirmation) {
        this.confirmation = confirmation;
    }
}

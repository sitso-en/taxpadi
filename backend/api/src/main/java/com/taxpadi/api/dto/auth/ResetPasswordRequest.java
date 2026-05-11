package com.taxpadi.api.dto.auth;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ResetPasswordRequest {

    @JsonProperty("reset_token")
    @NotBlank(message = "Reset token required")
    private String resetToken;

    @JsonProperty("new_password")
    @NotBlank(message = "New password required")
    @Size(min =8)
    private String newPassword;


    @JsonProperty("confirm_password")
    @NotBlank(message = "Confirm password required")
    @Size(min =8)
    private String confirmPassword;




    public String getResetToken() {
        return resetToken;
    }

    public void setResetToken(String resetToken) {
        this.resetToken = resetToken;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }

    public String getConfirmPassword() {
        return confirmPassword;
    }

    public void setConfirmPassword(String confirmPassword) {
        this.confirmPassword = confirmPassword;
    }

       
}

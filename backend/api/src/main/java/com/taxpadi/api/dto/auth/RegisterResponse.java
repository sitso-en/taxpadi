package com.taxpadi.api.dto.auth;

import java.util.UUID;
import com.fasterxml.jackson.annotation.JsonProperty;

public class RegisterResponse {

    @JsonProperty("user_id")
    private UUID userId;

    private String phone;

    private String message;

    public RegisterResponse(UUID userId, String phone, String message) {
        this.userId = userId;
        this.phone = phone;
        this.message = message;
    }

    // --- Getters and Setters ---

    public UUID getUserId() {
        return userId;
    }
    public void setUserId(UUID userId) {
        this.userId = userId;
    }


    public String getPhone() {
        return phone;
    }
    public void setPhone(String phone) {
        this.phone = phone;
    }


    public String getMessage() {
        return message;
    }
    public void setMessage(String message) {
        this.message = message;
    }
}
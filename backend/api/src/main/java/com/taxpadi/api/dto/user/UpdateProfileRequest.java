package com.taxpadi.api.dto.user;

import jakarta.validation.constraints.Email;

public class UpdateProfileRequest {

    private String fullName;

    @Email(message = "If provided, email must be valid")
    private String email;

    private String region;

    private String tin;


    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public String getTin() {
        return tin;
    }

    public void setTin(String tin) {
        this.tin = tin;
    }
}
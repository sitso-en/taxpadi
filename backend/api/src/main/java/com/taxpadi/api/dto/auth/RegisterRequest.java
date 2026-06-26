package com.taxpadi.api.dto.auth;

import com.taxpadi.api.model.TaxpayerCategory;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class RegisterRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Phone number is required")
    private String phone;

    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @NotBlank(message = "Region is required")
    private String region;

    @NotNull(message = "Taxpayer category is required")
    private TaxpayerCategory taxpayerCategory;

    // --- Getters and Setters ---

    public String getFullName() {
        return fullName;
    }
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }


    public String getPhone() {
        return phone;
    }
    public void setPhone(String phone) {
        this.phone = phone;
    }


    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }


    public String getPassword() {
        return password;
    }
    public void setPassword(String password) {
        this.password = password;
    }


    public String getRegion() {
        return region;
    }
    public void setRegion(String region) {
        this.region = region;
    }


    public TaxpayerCategory getTaxpayerCategory() {
        return taxpayerCategory;
    }
    public void setTaxpayerCategory(TaxpayerCategory taxpayerCategory) {
        this.taxpayerCategory = taxpayerCategory;
    }
}
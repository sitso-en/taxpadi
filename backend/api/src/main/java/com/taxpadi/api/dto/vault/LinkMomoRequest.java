package com.taxpadi.api.dto.vault;

import jakarta.validation.constraints.NotBlank;

public class LinkMomoRequest {

    @NotBlank
    private String momoNumber;

    @NotBlank
    private String momoProvider;

    public String getMomoNumber() { return momoNumber; }
    public void setMomoNumber(String v) { this.momoNumber = v; }
    public String getMomoProvider() { return momoProvider; }
    public void setMomoProvider(String v) { this.momoProvider = v; }
}

package com.taxpadi.api.dto.taxprofile;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class UpdateTaxProfileResponse {
    @JsonProperty("profile_id")
    private UUID profileId;

    @JsonProperty("vat_registration_no")
    private String vatRegistrationNo;

    @JsonProperty("nhil_registered")
    private Boolean nhilRegistered;

    @JsonProperty("tax_year_start")
    private LocalDate taxYearStart;

    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;

    public UUID getProfileId() { return profileId; }
    public void setProfileId(UUID v) { this.profileId = v; }

    public String getVatRegistrationNo() { return vatRegistrationNo; }
    public void setVatRegistrationNo(String v) { this.vatRegistrationNo = v; }

    public Boolean getNhilRegistered() { return nhilRegistered; }
    public void setNhilRegistered(Boolean v) { this.nhilRegistered = v; }

    public LocalDate getTaxYearStart() { return taxYearStart; }
    public void setTaxYearStart(LocalDate v) { this.taxYearStart = v; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime v) { this.updatedAt = v; }
}

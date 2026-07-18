package com.taxpadi.api.dto.taxprofile;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class TaxProfileDto {
    @JsonProperty("profile_id")
    private UUID profileId;

    @JsonProperty("user_id")
    private UUID userId;

    @JsonProperty("full_name")
    private String fullName;

    @JsonProperty("tin")
    private String tin;

    @JsonProperty("taxpayer_type")
    private String taxpayerType;

    @JsonProperty("region")
    private String region;

    @JsonProperty("registration_date")
    private LocalDateTime registrationDate;

    @JsonProperty("vat_registered")
    private Boolean vatRegistered;

    @JsonProperty("vat_registration_no")
    private String vatRegistrationNo;

    @JsonProperty("paye_registered")
    private Boolean payeRegistered;

    @JsonProperty("nhil_registered")
    private Boolean nhilRegistered;

    @JsonProperty("tax_year_start")
    private LocalDate taxYearStart;

    @JsonProperty("onboarding_complete")
    private Boolean onboardingComplete;

    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;

    public UUID getProfileId() { return profileId; }
    public void setProfileId(UUID v) { this.profileId = v; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID v) { this.userId = v; }

    public String getFullName() { return fullName; }
    public void setFullName(String v) { this.fullName = v; }

    public String getTin() { return tin; }
    public void setTin(String v) { this.tin = v; }

    public String getTaxpayerType() { return taxpayerType; }
    public void setTaxpayerType(String v) { this.taxpayerType = v; }

    public String getRegion() { return region; }
    public void setRegion(String v) { this.region = v; }

    public LocalDateTime getRegistrationDate() { return registrationDate; }
    public void setRegistrationDate(LocalDateTime v) { this.registrationDate = v; }

    public Boolean getVatRegistered() { return vatRegistered; }
    public void setVatRegistered(Boolean v) { this.vatRegistered = v; }

    public String getVatRegistrationNo() { return vatRegistrationNo; }
    public void setVatRegistrationNo(String v) { this.vatRegistrationNo = v; }

    public Boolean getPayeRegistered() { return payeRegistered; }
    public void setPayeRegistered(Boolean v) { this.payeRegistered = v; }

    public Boolean getNhilRegistered() { return nhilRegistered; }
    public void setNhilRegistered(Boolean v) { this.nhilRegistered = v; }

    public LocalDate getTaxYearStart() { return taxYearStart; }
    public void setTaxYearStart(LocalDate v) { this.taxYearStart = v; }

    public Boolean getOnboardingComplete() { return onboardingComplete; }
    public void setOnboardingComplete(Boolean v) { this.onboardingComplete = v; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime v) { this.createdAt = v; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime v) { this.updatedAt = v; }
}

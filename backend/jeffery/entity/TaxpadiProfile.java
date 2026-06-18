package com.taxpadi.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tax_profiles")
public class TaxProfile {

    @Id
    @Column(nullable = false, unique = true)
    private String profileId = UUID.randomUUID().toString();

    @Column(name = "user_id", nullable = false, unique = true)
    private String userId;

    @Column(name = "vat_registered", nullable = false)
    private boolean vatRegistered = false;

    @Column(name = "vat_registration_no")
    private String vatRegistrationNo;

    @Column(name = "paye_registered", nullable = false)
    private boolean payeRegistered = false;

    @Column(name = "nhil_registered", nullable = false)
    private boolean nhilRegistered = false;

    @Column(name = "tax_year_start")
    private LocalDate taxYearStart;

    @Column(name = "tin")
    private String tin;

    @Column(name = "onboarding_complete", nullable = false)
    private boolean onboardingComplete = false;

    @Column(name = "tax_year_locked", nullable = false)
    private boolean taxYearLocked = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public TaxProfile() {}

    public String getProfileId() { return profileId; }
    public String getUserId() { return userId; }
    public boolean isVatRegistered() { return vatRegistered; }
    public String getVatRegistrationNo() { return vatRegistrationNo; }
    public boolean isPayeRegistered() { return payeRegistered; }
    public boolean isNhilRegistered() { return nhilRegistered; }
    public LocalDate getTaxYearStart() { return taxYearStart; }
    public String getTin() { return tin; }
    public boolean isOnboardingComplete() { return onboardingComplete; }
    public boolean isTaxYearLocked() { return taxYearLocked; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public void setUserId(String v) { this.userId = v; }
    public void setVatRegistered(boolean v) { this.vatRegistered = v; }
    public void setVatRegistrationNo(String v) { this.vatRegistrationNo = v; }
    public void setPayeRegistered(boolean v) { this.payeRegistered = v; }
    public void setNhilRegistered(boolean v) { this.nhilRegistered = v; }
    public void setTaxYearStart(LocalDate v) { this.taxYearStart = v; }
    public void setTin(String v) { this.tin = v; }
    public void setOnboardingComplete(boolean v) { this.onboardingComplete = v; }
    public void setTaxYearLocked(boolean v) { this.taxYearLocked = v; }
    public void setUpdatedAt(LocalDateTime v) { this.updatedAt = v; }
}
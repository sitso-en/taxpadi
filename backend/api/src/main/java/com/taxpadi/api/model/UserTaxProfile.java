package com.taxpadi.api.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name="user_tax_profiles")
public class UserTaxProfile {
    @Id
    @GeneratedValue(strategy=GenerationType.UUID)
    @Column(name="profile_id")
    private UUID profileId;
    

    @OneToOne
    @JoinColumn(name="user_id")
    private User user;


    @Column(name="vat_registered")
    private Boolean vatRegistered = false;

    @Column(name="vat_registration_no", length=30)
    private String vatRegistrationNo;

    @Column(name="paye_registered")
    private Boolean payeRegistered = false;

    @Column(name="nhil_registered")
    private Boolean nhilRegistered = false;

    @Column(name="tax_year_start")
    private LocalDate taxYearStart;

    @Column(name="onboarding_complete")
    private Boolean onboardingComplete = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // --- JPA Lifecycle Callbacks ---
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }




    // --- Getters and Setters ---

    public User getUser() {
        return user;
    }
    public void setUser(User user) {
        this.user = user;
    }


    public UUID getProfileId() {
        return profileId;
    }


    public Boolean getVatRegistered() {
        return vatRegistered;
    }
    public void setVatRegistered(Boolean vatRegistered) {
        this.vatRegistered = vatRegistered;
    }


    public String getVatRegistrationNo() {
        return vatRegistrationNo;
    }
    public void setVatRegistrationNo(String vatRegistrationNo) {
        this.vatRegistrationNo = vatRegistrationNo;
    }

    
    public Boolean getPayeRegistered() {
        return payeRegistered;
    }
    public void setPayeRegistered(Boolean payeRegistered) {
        this.payeRegistered = payeRegistered;
    }



    public Boolean getNhilRegistered() {
        return nhilRegistered;
    }
    public void setNhilRegistered(Boolean nhilRegistered) {
        this.nhilRegistered = nhilRegistered;
    }



    public LocalDate getTaxYearStart() {
        return taxYearStart;
    }
    public void setTaxYearStart(LocalDate taxYearStart) {
        this.taxYearStart = taxYearStart;
    }


    public Boolean getOnboardingComplete() {
        return onboardingComplete;
    }
    public void setOnboardingComplete(Boolean onboardingComplete) {
        this.onboardingComplete = onboardingComplete;
    }


    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
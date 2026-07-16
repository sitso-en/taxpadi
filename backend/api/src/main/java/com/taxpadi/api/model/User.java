package com.taxpadi.api.model;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Column(name = "email", length = 150, unique = true)
    private String email;

    @Column(name = "phone", nullable = false, unique = true, length = 20)
    private String phone;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "tin", unique = true, length = 20)
    private String tin;

    @Column(name = "region", length = 100)
    private String region;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "taxpayer_category", nullable = false, length = 30)
    private TaxpayerCategory taxpayerCategory;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "subscription_tier", nullable = false, length = 20)
    private SubscriptionTier subscriptionTier = SubscriptionTier.FREE;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    private Role role = Role.USER;

    @Column(name = "active_profile_id")
    private UUID activeProfileId;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "is_verified")
    private Boolean isVerified = false;

    @Column(name = "failed_login_attempts", nullable = false)
    private int failedLoginAttempts = 0;

    @Column(name = "locked_until")
    private LocalDateTime lockedUntil;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "notification_preferences", columnDefinition = "jsonb")
    private Map<String, Boolean> notificationPreferences = Map.of(
        "deadline_reminders", true,
        "penalty_alerts", true,
        "vault_suggestions", true,
        "referral_offers", true,
        "payment_confirmations", true,
        "system_updates", true
    );

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }






    //GETTERS AND SETTERS


    //user id
    public UUID getUserId(){
        return userId;
    }

    // full name
    public String getFullName(){
        return fullName;
    }
    public void setFullName(String fullName){
        this.fullName=fullName;
    }

    //email
    public String getEmail(){
        return email;
    }
    public void setEmail(String email){
        this.email=email;
    }

    //phone
    public String getPhone(){
        return phone;
    }
    public void setPhone(String phone){
        this.phone=phone;
    }

    //password hash
    public String getPasswordHash(){
        return passwordHash;
    }
    public void setPasswordHash(String passwordHash){
        this.passwordHash=passwordHash;
    }


    //tin
    public String getTin(){
        return tin;
    }
    public void setTin(String tin){
        this.tin=tin;
    }


    //region
    public String getRegion(){
        return region;
    }
    public void setRegion(String region){
        this.region=region;
    }

    //taxpayer category
    public TaxpayerCategory getTaxpayerCategory(){
        return taxpayerCategory;
    }
    public void setTaxpayerCategory(TaxpayerCategory taxpayerCategory){
        this.taxpayerCategory=taxpayerCategory;
    }

    //subscription tier
    public SubscriptionTier getSubscriptionTier(){
        return subscriptionTier;
    }
    public void setSubscriptionTier(SubscriptionTier subscriptionTier){
        this.subscriptionTier=subscriptionTier;
    }

    //role
    public Role getRole(){
        return role;
    }
    public void setRole(Role role){
        this.role=role;
    }

    //active profile id
    public UUID getActiveProfileId(){
        return activeProfileId;
    }
    public void setActiveProfileId(UUID activeProfileId){
        this.activeProfileId=activeProfileId;
    }

    //is active
    public Boolean isActive() {
      return isActive;
    }
    public void setActive(Boolean isActive) {
        this.isActive = isActive;
    }


    //is verified
    public Boolean isVerified() {
      return isVerified;
    }
    public void setVerified(Boolean isVerified) {
        this.isVerified = isVerified;
    }

    public int getFailedLoginAttempts() { return failedLoginAttempts; }
    public void setFailedLoginAttempts(int failedLoginAttempts) { this.failedLoginAttempts = failedLoginAttempts; }

    public LocalDateTime getLockedUntil() { return lockedUntil; }
    public void setLockedUntil(LocalDateTime lockedUntil) { this.lockedUntil = lockedUntil; }


    //notifitcation preferences
    public Map<String, Boolean> getNotificationPreferences(){
        return notificationPreferences;
    }
    public void setNotificationPreferences(Map<String, Boolean> notificationPreferences){
        this.notificationPreferences=notificationPreferences;
    }


    //created at
    public LocalDateTime getCreatedAt(){
        return createdAt;
    }


    public LocalDateTime getUpdatedAt(){
        return updatedAt;
    }

}



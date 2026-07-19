package com.taxpadi.api.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "savings_vault")
public class SavingsVault {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "vault_id")
    private UUID vaultId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 100)
    private String vaultName;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal balance = BigDecimal.ZERO;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal targetAmount = BigDecimal.ZERO;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal autoSaveAmount = BigDecimal.ZERO;

    @Column(nullable = false, length = 20)
    private String autoSaveFrequency = "MONTHLY";

    private boolean autoSaveEnabled = false;

    @Column(nullable = false, length = 20)
    private String status = "ACTIVE";

    @Column(length = 200)
    private String purpose;

    @Column(name = "linked_momo_number", length = 20)
    private String linkedMomoNumber;

    @Column(name = "linked_momo_provider", length = 30)
    private String linkedMomoProvider;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

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

    public UUID getVaultId() { return vaultId; }
    public User getUser() { return user; }
    public void setUser(User v) { this.user = v; }
    public String getVaultName() { return vaultName; }
    public void setVaultName(String v) { this.vaultName = v; }
    public BigDecimal getBalance() { return balance; }
    public void setBalance(BigDecimal v) { this.balance = v; }
    public BigDecimal getTargetAmount() { return targetAmount; }
    public void setTargetAmount(BigDecimal v) { this.targetAmount = v; }
    public BigDecimal getAutoSaveAmount() { return autoSaveAmount; }
    public void setAutoSaveAmount(BigDecimal v) { this.autoSaveAmount = v; }
    public String getAutoSaveFrequency() { return autoSaveFrequency; }
    public void setAutoSaveFrequency(String v) { this.autoSaveFrequency = v; }
    public boolean isAutoSaveEnabled() { return autoSaveEnabled; }
    public void setAutoSaveEnabled(boolean v) { this.autoSaveEnabled = v; }
    public String getStatus() { return status; }
    public void setStatus(String v) { this.status = v; }
    public String getPurpose() { return purpose; }
    public void setPurpose(String v) { this.purpose = v; }
    public String getLinkedMomoNumber() { return linkedMomoNumber; }
    public void setLinkedMomoNumber(String v) { this.linkedMomoNumber = v; }
    public String getLinkedMomoProvider() { return linkedMomoProvider; }
    public void setLinkedMomoProvider(String v) { this.linkedMomoProvider = v; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}

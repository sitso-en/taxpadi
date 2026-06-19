package com.taxpadi.api.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "vault_transactions")
public class VaultTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "transaction_id")
    private UUID transactionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vault_id", nullable = false)
    private SavingsVault vault;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal balanceAfter;

    private String description;

    private String reference;

    @Column(nullable = false)
    private String trigger = "MANUAL";

    private String momoReference;

    @Column(nullable = false)
    private String status = "PENDING";

    private LocalDateTime confirmedAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public UUID getTransactionId() { return transactionId; }
    public SavingsVault getVault() { return vault; }
    public void setVault(SavingsVault v) { this.vault = v; }
    public String getType() { return type; }
    public void setType(String v) { this.type = v; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal v) { this.amount = v; }
    public BigDecimal getBalanceAfter() { return balanceAfter; }
    public void setBalanceAfter(BigDecimal v) { this.balanceAfter = v; }
    public String getDescription() { return description; }
    public void setDescription(String v) { this.description = v; }
    public String getReference() { return reference; }
    public void setReference(String v) { this.reference = v; }
    public String getTrigger() { return trigger; }
    public void setTrigger(String v) { this.trigger = v; }
    public String getMomoReference() { return momoReference; }
    public void setMomoReference(String v) { this.momoReference = v; }
    public String getStatus() { return status; }
    public void setStatus(String v) { this.status = v; }
    public LocalDateTime getConfirmedAt() { return confirmedAt; }
    public void setConfirmedAt(LocalDateTime v) { this.confirmedAt = v; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}

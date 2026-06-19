package com.taxpadi.api.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "penalties")
public class Penalty {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "penalty_id")
    private UUID penaltyId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String taxType;

    @Column(nullable = false)
    private String penaltyType;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal originalTaxAmount;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal penaltyAmount;

    @Column(precision = 5, scale = 4)
    private BigDecimal penaltyRate;

    @Column(nullable = false)
    private LocalDate dueDate;

    @Column(nullable = false)
    private LocalDate filingDate;

    private int daysLate;

    @Column(nullable = false)
    private String status;

    private String description;

    private String referenceNumber;

    private LocalDateTime paidAt;

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

    public UUID getPenaltyId() { return penaltyId; }
    public User getUser() { return user; }
    public void setUser(User v) { this.user = v; }
    public String getTaxType() { return taxType; }
    public void setTaxType(String v) { this.taxType = v; }
    public String getPenaltyType() { return penaltyType; }
    public void setPenaltyType(String v) { this.penaltyType = v; }
    public BigDecimal getOriginalTaxAmount() { return originalTaxAmount; }
    public void setOriginalTaxAmount(BigDecimal v) { this.originalTaxAmount = v; }
    public BigDecimal getPenaltyAmount() { return penaltyAmount; }
    public void setPenaltyAmount(BigDecimal v) { this.penaltyAmount = v; }
    public BigDecimal getPenaltyRate() { return penaltyRate; }
    public void setPenaltyRate(BigDecimal v) { this.penaltyRate = v; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate v) { this.dueDate = v; }
    public LocalDate getFilingDate() { return filingDate; }
    public void setFilingDate(LocalDate v) { this.filingDate = v; }
    public int getDaysLate() { return daysLate; }
    public void setDaysLate(int v) { this.daysLate = v; }
    public String getStatus() { return status; }
    public void setStatus(String v) { this.status = v; }
    public String getDescription() { return description; }
    public void setDescription(String v) { this.description = v; }
    public String getReferenceNumber() { return referenceNumber; }
    public void setReferenceNumber(String v) { this.referenceNumber = v; }
    public LocalDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(LocalDateTime v) { this.paidAt = v; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}

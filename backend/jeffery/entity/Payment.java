package com.taxpadi.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @Column(nullable = false, unique = true)
    private String paymentId = UUID.randomUUID().toString();

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "return_id")
    private String returnId;

    @Column(name = "penalty_id")
    private String penaltyId;

    @Column(name = "certificate_id")
    private String certificateId;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(name = "payment_method", nullable = false)
    private String paymentMethod;

    @Column(name = "payment_reference")
    private String paymentReference;

    @Column(name = "momo_number")
    private String momoNumber;

    @Column(name = "momo_provider")
    private String momoProvider;

    @Column(nullable = false)
    private String status = "pending";

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Payment() {}

    public String getPaymentId() { return paymentId; }
    public String getUserId() { return userId; }
    public String getReturnId() { return returnId; }
    public String getPenaltyId() { return penaltyId; }
    public String getCertificateId() { return certificateId; }
    public BigDecimal getAmount() { return amount; }
    public String getPaymentMethod() { return paymentMethod; }
    public String getPaymentReference() { return paymentReference; }
    public String getMomoNumber() { return momoNumber; }
    public String getMomoProvider() { return momoProvider; }
    public String getStatus() { return status; }
    public LocalDateTime getPaidAt() { return paidAt; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public void setUserId(String v) { this.userId = v; }
    public void setReturnId(String v) { this.returnId = v; }
    public void setPenaltyId(String v) { this.penaltyId = v; }
    public void setCertificateId(String v) { this.certificateId = v; }
    public void setAmount(BigDecimal v) { this.amount = v; }
    public void setPaymentMethod(String v) { this.paymentMethod = v; }
    public void setPaymentReference(String v) { this.paymentReference = v; }
    public void setMomoNumber(String v) { this.momoNumber = v; }
    public void setMomoProvider(String v) { this.momoProvider = v; }
    public void setStatus(String v) { this.status = v; }
    public void setPaidAt(LocalDateTime v) { this.paidAt = v; }
    public void setExpiresAt(LocalDateTime v) { this.expiresAt = v; }
    public void setUpdatedAt(LocalDateTime v) { this.updatedAt = v; }
}
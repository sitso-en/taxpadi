cat << 'EOF'
        package com.taxpadi.jeffery.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "subscriptions")
public class Subscription {

    @Id
    @Column(nullable = false, unique = true)
    private String id = UUID.randomUUID().toString();

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(nullable = false)
    private String plan;

    @Column(nullable = false)
    private String status;

    @Column(name = "subscription_tier", nullable = false)
    private String subscriptionTier = "free";

    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private String currency = "GHS";

    @Column(name = "payment_reference")
    private String paymentReference;

    @Column(name = "momo_number")
    private String momoNumber;

    @Column(name = "auto_renew")
    private Boolean autoRenew = true;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "cancel_reason")
    private String cancelReason;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Subscription() {}

    public String getId() { return id; }
    public String getUserId() { return userId; }
    public String getPlan() { return plan; }
    public String getStatus() { return status; }
    public String getSubscriptionTier() { return subscriptionTier; }
    public String getPaymentMethod() { return paymentMethod; }
    public BigDecimal getAmount() { return amount; }
    public String getCurrency() { return currency; }
    public String getPaymentReference() { return paymentReference; }
    public String getMomoNumber() { return momoNumber; }
    public Boolean getAutoRenew() { return autoRenew; }
    public LocalDateTime getStartedAt() { return startedAt; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public LocalDateTime getCancelledAt() { return cancelledAt; }
    public String getCancelReason() { return cancelReason; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public void setUserId(String v) { this.userId = v; }
    public void setPlan(String v) { this.plan = v; }
    public void setStatus(String v) { this.status = v; }
    public void setSubscriptionTier(String v) { this.subscriptionTier = v; }
    public void setPaymentMethod(String v) { this.paymentMethod = v; }
    public void setAmount(BigDecimal v) { this.amount = v; }
    public void setCurrency(String v) { this.currency = v; }
    public void setPaymentReference(String v) { this.paymentReference = v; }
    public void setMomoNumber(String v) { this.momoNumber = v; }
    public void setAutoRenew(Boolean v) { this.autoRenew = v; }
    public void setStartedAt(LocalDateTime v) { this.startedAt = v; }
    public void setExpiresAt(LocalDateTime v) { this.expiresAt = v; }
    public void setCancelledAt(LocalDateTime v) { this.cancelledAt = v; }
    public void setCancelReason(String v) { this.cancelReason = v; }
    public void setUpdatedAt(LocalDateTime v) { this.updatedAt = v; }
}
EOF
package com.app.entity;
import com.app.enums.*;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "subscriptions")
public class Subscription {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false) private User user;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private BillingCycle billingCycle;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private SubscriptionStatus status;
    @Column(name = "plan_name", nullable = false) private String planName;
    @Column(name = "base_amount", nullable = false, precision = 10, scale = 2) private BigDecimal baseAmount;
    @Column(name = "tax_amount", nullable = false, precision = 10, scale = 2) private BigDecimal taxAmount;
    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2) private BigDecimal totalAmount;
    private String paystackSubscriptionCode;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime nextBillingDate;
    private boolean autoRenew = true;
    @CreationTimestamp @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;

    public Subscription() {}
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private User user; private BillingCycle billingCycle; private SubscriptionStatus status;
        private String planName; private BigDecimal baseAmount; private BigDecimal taxAmount;
        private BigDecimal totalAmount; private String paystackSubscriptionCode;
        private LocalDateTime startDate; private LocalDateTime endDate; private LocalDateTime nextBillingDate;
        private boolean autoRenew = true;
        public Builder user(User u) { this.user = u; return this; }
        public Builder billingCycle(BillingCycle b) { this.billingCycle = b; return this; }
        public Builder status(SubscriptionStatus s) { this.status = s; return this; }
        public Builder planName(String p) { this.planName = p; return this; }
        public Builder baseAmount(BigDecimal a) { this.baseAmount = a; return this; }
        public Builder taxAmount(BigDecimal a) { this.taxAmount = a; return this; }
        public Builder totalAmount(BigDecimal a) { this.totalAmount = a; return this; }
        public Builder paystackSubscriptionCode(String c) { this.paystackSubscriptionCode = c; return this; }
        public Builder startDate(LocalDateTime d) { this.startDate = d; return this; }
        public Builder endDate(LocalDateTime d) { this.endDate = d; return this; }
        public Builder nextBillingDate(LocalDateTime d) { this.nextBillingDate = d; return this; }
        public Builder autoRenew(boolean a) { this.autoRenew = a; return this; }
        public Subscription build() {
            Subscription s = new Subscription(); s.user = user; s.billingCycle = billingCycle;
            s.status = status; s.planName = planName; s.baseAmount = baseAmount;
            s.taxAmount = taxAmount; s.totalAmount = totalAmount;
            s.paystackSubscriptionCode = paystackSubscriptionCode;
            s.startDate = startDate; s.endDate = endDate; s.nextBillingDate = nextBillingDate;
            s.autoRenew = autoRenew; return s;
        }
    }
    public Long getId() { return id; }
    public User getUser() { return user; }
    public BillingCycle getBillingCycle() { return billingCycle; }
    public SubscriptionStatus getStatus() { return status; }
    public String getPlanName() { return planName; }
    public BigDecimal getBaseAmount() { return baseAmount; }
    public BigDecimal getTaxAmount() { return taxAmount; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public String getPaystackSubscriptionCode() { return paystackSubscriptionCode; }
    public LocalDateTime getStartDate() { return startDate; }
    public LocalDateTime getEndDate() { return endDate; }
    public LocalDateTime getNextBillingDate() { return nextBillingDate; }
    public boolean isAutoRenew() { return autoRenew; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setStatus(SubscriptionStatus s) { this.status = s; }
    public void setEndDate(LocalDateTime d) { this.endDate = d; }
    public void setNextBillingDate(LocalDateTime d) { this.nextBillingDate = d; }
}

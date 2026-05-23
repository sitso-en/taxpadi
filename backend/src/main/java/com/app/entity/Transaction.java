package com.app.entity;
import com.app.enums.PaymentStatus;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
public class Transaction {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false) private User user;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "subscription_id") private Subscription subscription;
    @Column(nullable = false, unique = true) private String reference;
    private String paystackReference;
    @Column(name = "base_amount", nullable = false, precision = 10, scale = 2) private BigDecimal baseAmount;
    @Column(name = "tax_amount", nullable = false, precision = 10, scale = 2) private BigDecimal taxAmount;
    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2) private BigDecimal totalAmount;
    @Column(nullable = false) private String currency = "NGN";
    @Enumerated(EnumType.STRING) @Column(nullable = false) private PaymentStatus status;
    private String paymentChannel;
    private String taxReceiptNumber;
    private String gatewayResponse;
    private LocalDateTime paidAt;
    @CreationTimestamp @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;

    public Transaction() {}

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private User user; private Subscription subscription; private String reference;
        private String paystackReference; private BigDecimal baseAmount; private BigDecimal taxAmount;
        private BigDecimal totalAmount; private String currency = "NGN"; private PaymentStatus status;
        private String paymentChannel; private String taxReceiptNumber; private String gatewayResponse;
        private LocalDateTime paidAt;
        public Builder user(User u) { this.user = u; return this; }
        public Builder subscription(Subscription s) { this.subscription = s; return this; }
        public Builder reference(String r) { this.reference = r; return this; }
        public Builder paystackReference(String r) { this.paystackReference = r; return this; }
        public Builder baseAmount(BigDecimal a) { this.baseAmount = a; return this; }
        public Builder taxAmount(BigDecimal a) { this.taxAmount = a; return this; }
        public Builder totalAmount(BigDecimal a) { this.totalAmount = a; return this; }
        public Builder currency(String c) { this.currency = c; return this; }
        public Builder status(PaymentStatus s) { this.status = s; return this; }
        public Builder paymentChannel(String c) { this.paymentChannel = c; return this; }
        public Builder taxReceiptNumber(String t) { this.taxReceiptNumber = t; return this; }
        public Builder gatewayResponse(String g) { this.gatewayResponse = g; return this; }
        public Builder paidAt(LocalDateTime p) { this.paidAt = p; return this; }
        public Transaction build() {
            Transaction t = new Transaction(); t.user = user; t.subscription = subscription;
            t.reference = reference; t.paystackReference = paystackReference;
            t.baseAmount = baseAmount; t.taxAmount = taxAmount; t.totalAmount = totalAmount;
            t.currency = currency; t.status = status; t.paymentChannel = paymentChannel;
            t.taxReceiptNumber = taxReceiptNumber; t.gatewayResponse = gatewayResponse; t.paidAt = paidAt;
            return t;
        }
    }

    public Long getId() { return id; }
    public User getUser() { return user; }
    public Subscription getSubscription() { return subscription; }
    public String getReference() { return reference; }
    public String getPaystackReference() { return paystackReference; }
    public BigDecimal getBaseAmount() { return baseAmount; }
    public BigDecimal getTaxAmount() { return taxAmount; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public String getCurrency() { return currency; }
    public PaymentStatus getStatus() { return status; }
    public String getPaymentChannel() { return paymentChannel; }
    public String getTaxReceiptNumber() { return taxReceiptNumber; }
    public String getGatewayResponse() { return gatewayResponse; }
    public LocalDateTime getPaidAt() { return paidAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setStatus(PaymentStatus s) { this.status = s; }
    public void setPaystackReference(String r) { this.paystackReference = r; }
    public void setGatewayResponse(String g) { this.gatewayResponse = g; }
    public void setPaidAt(LocalDateTime p) { this.paidAt = p; }
    public void setTaxReceiptNumber(String t) { this.taxReceiptNumber = t; }
}

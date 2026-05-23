package com.app.entity;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "tax_records")
public class TaxRecord {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "transaction_id", nullable = false) private Transaction transaction;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false) private User user;
    @Column(name = "tax_type", nullable = false) private String taxType = "VAT";
    @Column(name = "tax_rate", nullable = false, precision = 5, scale = 4) private BigDecimal taxRate;
    @Column(name = "taxable_amount", nullable = false, precision = 10, scale = 2) private BigDecimal taxableAmount;
    @Column(name = "tax_amount", nullable = false, precision = 10, scale = 2) private BigDecimal taxAmount;
    @Column(name = "receipt_number", unique = true, nullable = false) private String receiptNumber;
    @Column(name = "tax_period") private String taxPeriod;
    @CreationTimestamp @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;

    public TaxRecord() {}
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Transaction transaction; private User user; private String taxType = "VAT";
        private BigDecimal taxRate; private BigDecimal taxableAmount; private BigDecimal taxAmount;
        private String receiptNumber; private String taxPeriod;
        public Builder transaction(Transaction t) { this.transaction = t; return this; }
        public Builder user(User u) { this.user = u; return this; }
        public Builder taxType(String t) { this.taxType = t; return this; }
        public Builder taxRate(BigDecimal r) { this.taxRate = r; return this; }
        public Builder taxableAmount(BigDecimal a) { this.taxableAmount = a; return this; }
        public Builder taxAmount(BigDecimal a) { this.taxAmount = a; return this; }
        public Builder receiptNumber(String r) { this.receiptNumber = r; return this; }
        public Builder taxPeriod(String p) { this.taxPeriod = p; return this; }
        public TaxRecord build() {
            TaxRecord r = new TaxRecord(); r.transaction = transaction; r.user = user;
            r.taxType = taxType; r.taxRate = taxRate; r.taxableAmount = taxableAmount;
            r.taxAmount = taxAmount; r.receiptNumber = receiptNumber; r.taxPeriod = taxPeriod;
            return r;
        }
    }
    public Long getId() { return id; }
    public Transaction getTransaction() { return transaction; }
    public User getUser() { return user; }
    public String getTaxType() { return taxType; }
    public BigDecimal getTaxRate() { return taxRate; }
    public BigDecimal getTaxableAmount() { return taxableAmount; }
    public BigDecimal getTaxAmount() { return taxAmount; }
    public String getReceiptNumber() { return receiptNumber; }
    public String getTaxPeriod() { return taxPeriod; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}

package com.taxpadi.api.model;

import jakarta.persistence.*;
import org.hibernate.annotations.SQLRestriction;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "transactions")
@SQLRestriction("is_active = true")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "transaction_id", updatable = false, nullable = false)
    private UUID transactionId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 10)
    private String type; //income or expense

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "entry_method", nullable = false, length = 20)
    private String entryMethod; // manual/ voice/scan/import/invoice

    @Column(name = "receipt_url", length = 500)
    private String receiptUrl;

    @Column(name = "tax_deductible", nullable = false)
    private Boolean taxDeductible = false;

    @Column(name = "withholding_applicable", nullable = false)
    private Boolean withholdingApplicable = false;

    @Column(name = "withholding_amount", precision = 15, scale = 2)
    private BigDecimal withholdingAmount = BigDecimal.ZERO;

    @Column(name = "withholding_remitted", nullable = false)
    private Boolean withholdingRemitted = false;

    @Column(name = "withholding_remitted_at")
    private LocalDateTime withholdingRemittedAt;

    @Column(name = "transaction_date", nullable = false)
    private LocalDate transactionDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public UUID getTransactionId() { return transactionId; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getEntryMethod() { return entryMethod; }
    public void setEntryMethod(String entryMethod) { this.entryMethod = entryMethod; }
    public String getReceiptUrl() { return receiptUrl; }
    public void setReceiptUrl(String receiptUrl) { this.receiptUrl = receiptUrl; }
    public Boolean getTaxDeductible() { return taxDeductible; }
    public void setTaxDeductible(Boolean taxDeductible) { this.taxDeductible = taxDeductible; }
    public Boolean getWithholdingApplicable() { return withholdingApplicable; }
    public void setWithholdingApplicable(Boolean withholdingApplicable) { this.withholdingApplicable = withholdingApplicable; }
    public BigDecimal getWithholdingAmount() { return withholdingAmount; }
    public void setWithholdingAmount(BigDecimal withholdingAmount) { this.withholdingAmount = withholdingAmount; }
    public Boolean getWithholdingRemitted() { return withholdingRemitted; }
    public void setWithholdingRemitted(Boolean withholdingRemitted) { this.withholdingRemitted = withholdingRemitted; }
    public LocalDateTime getWithholdingRemittedAt() { return withholdingRemittedAt; }
    public void setWithholdingRemittedAt(LocalDateTime withholdingRemittedAt) { this.withholdingRemittedAt = withholdingRemittedAt; }
    public LocalDate getTransactionDate() { return transactionDate; }
    public void setTransactionDate(LocalDate transactionDate) { this.transactionDate = transactionDate; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}

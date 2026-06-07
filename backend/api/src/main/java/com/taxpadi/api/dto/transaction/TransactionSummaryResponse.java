package com.taxpadi.api.dto.transaction;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class TransactionSummaryResponse {

    private UUID transactionId;
    private String type;
    private BigDecimal amount;
    private String category;
    private String description;
    private String entryMethod;
    private String receiptUrl;
    private Boolean taxDeductible;
    private Boolean withholdingApplicable;
    private BigDecimal withholdingAmount;
    private Boolean withholdingRemitted;
    private LocalDate transactionDate;
    private LocalDateTime createdAt;

    public UUID getTransactionId() { return transactionId; }
    public void setTransactionId(UUID transactionId) { this.transactionId = transactionId; }

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

    public LocalDate getTransactionDate() { return transactionDate; }
    public void setTransactionDate(LocalDate transactionDate) { this.transactionDate = transactionDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

package com.taxpadi.api.dto.withholding;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class WhtRemitResponse {

    private UUID transactionId;
    private String description;
    private String category;
    private BigDecimal amount;
    private BigDecimal withholdingAmount;
    private Boolean remitted;
    private LocalDateTime remittedAt;

    public UUID getTransactionId() { return transactionId; }
    public void setTransactionId(UUID transactionId) { this.transactionId = transactionId; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public BigDecimal getWithholdingAmount() { return withholdingAmount; }
    public void setWithholdingAmount(BigDecimal withholdingAmount) { this.withholdingAmount = withholdingAmount; }

    public Boolean getRemitted() { return remitted; }
    public void setRemitted(Boolean remitted) { this.remitted = remitted; }

    public LocalDateTime getRemittedAt() { return remittedAt; }
    public void setRemittedAt(LocalDateTime remittedAt) { this.remittedAt = remittedAt; }
}

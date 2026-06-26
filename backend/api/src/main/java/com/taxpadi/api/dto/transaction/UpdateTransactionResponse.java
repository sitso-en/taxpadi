package com.taxpadi.api.dto.transaction;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class UpdateTransactionResponse {

    private UUID transactionId;
    private BigDecimal amount;
    private String category;
    private Boolean taxDeductible;
    private WithholdingInfo withholding;
    private LocalDate transactionDate;
    private LocalDateTime updatedAt;
    private Boolean taxLiabilityUpdated;

    public UUID getTransactionId() { return transactionId; }
    public void setTransactionId(UUID transactionId) { this.transactionId = transactionId; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Boolean getTaxDeductible() { return taxDeductible; }
    public void setTaxDeductible(Boolean taxDeductible) { this.taxDeductible = taxDeductible; }

    public WithholdingInfo getWithholding() { return withholding; }
    public void setWithholding(WithholdingInfo withholding) { this.withholding = withholding; }

    public LocalDate getTransactionDate() { return transactionDate; }
    public void setTransactionDate(LocalDate transactionDate) { this.transactionDate = transactionDate; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Boolean getTaxLiabilityUpdated() { return taxLiabilityUpdated; }
    public void setTaxLiabilityUpdated(Boolean taxLiabilityUpdated) { this.taxLiabilityUpdated = taxLiabilityUpdated; }
}

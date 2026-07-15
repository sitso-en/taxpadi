package com.taxpadi.api.dto.transaction;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public class ScanTransactionResponse {
    private UUID transactionId;
    private String type;
    private BigDecimal amount;
    private String category;
    private String description;
    private String entryMethod;
    private String receiptUrl;
    private Boolean taxDeductible;
    private LocalDate transactionDate;
    private String ocrConfidence;
    private boolean needsReview;
    private boolean taxLiabilityUpdated;

    public UUID getTransactionId() { return transactionId; }
    public void setTransactionId(UUID v) { this.transactionId = v; }

    public String getType() { return type; }
    public void setType(String v) { this.type = v; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal v) { this.amount = v; }

    public String getCategory() { return category; }
    public void setCategory(String v) { this.category = v; }

    public String getDescription() { return description; }
    public void setDescription(String v) { this.description = v; }

    public String getEntryMethod() { return entryMethod; }
    public void setEntryMethod(String v) { this.entryMethod = v; }

    public String getReceiptUrl() { return receiptUrl; }
    public void setReceiptUrl(String v) { this.receiptUrl = v; }

    public Boolean getTaxDeductible() { return taxDeductible; }
    public void setTaxDeductible(Boolean v) { this.taxDeductible = v; }

    public LocalDate getTransactionDate() { return transactionDate; }
    public void setTransactionDate(LocalDate v) { this.transactionDate = v; }

    public String getOcrConfidence() { return ocrConfidence; }
    public void setOcrConfidence(String v) { this.ocrConfidence = v; }

    public boolean isNeedsReview() { return needsReview; }
    public void setNeedsReview(boolean v) { this.needsReview = v; }

    public boolean isTaxLiabilityUpdated() { return taxLiabilityUpdated; }
    public void setTaxLiabilityUpdated(boolean v) { this.taxLiabilityUpdated = v; }
}

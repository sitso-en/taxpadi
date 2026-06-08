package com.taxpadi.api.dto.withholding;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class WhtTransactionDto {

    private UUID transactionId;
    private String description;
    private String category;
    private LocalDate transactionDate;
    private BigDecimal amount;
    private String withholdingRate;
    private BigDecimal withholdingAmount;
    private boolean remitted;
    private LocalDateTime remittedAt;

    public WhtTransactionDto(UUID transactionId, String description, String category,
                              LocalDate transactionDate, BigDecimal amount,
                              String withholdingRate, BigDecimal withholdingAmount,
                              boolean remitted, LocalDateTime remittedAt) {
        this.transactionId = transactionId;
        this.description = description;
        this.category = category;
        this.transactionDate = transactionDate;
        this.amount = amount;
        this.withholdingRate = withholdingRate;
        this.withholdingAmount = withholdingAmount;
        this.remitted = remitted;
        this.remittedAt = remittedAt;
    }

    public UUID getTransactionId() { return transactionId; }
    public String getDescription() { return description; }
    public String getCategory() { return category; }
    public LocalDate getTransactionDate() { return transactionDate; }
    public BigDecimal getAmount() { return amount; }
    public String getWithholdingRate() { return withholdingRate; }
    public BigDecimal getWithholdingAmount() { return withholdingAmount; }
    public boolean isRemitted() { return remitted; }
    public LocalDateTime getRemittedAt() { return remittedAt; }
}

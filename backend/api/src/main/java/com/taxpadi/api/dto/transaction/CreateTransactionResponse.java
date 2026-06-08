package com.taxpadi.api.dto.transaction;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class CreateTransactionResponse {

    private UUID transactionId;
    private String type;
    private BigDecimal amount;
    private String category;
    private String entryMethod;
    private Boolean taxDeductible;
    private WithholdingInfo withholding;
    private LocalDate transactionDate;
    private Boolean taxLiabilityUpdated;
    private VaultSuggestion vaultSuggestion;

    public UUID getTransactionId() { return transactionId; }
    public void setTransactionId(UUID transactionId) { this.transactionId = transactionId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getEntryMethod() { return entryMethod; }
    public void setEntryMethod(String entryMethod) { this.entryMethod = entryMethod; }

    public Boolean getTaxDeductible() { return taxDeductible; }
    public void setTaxDeductible(Boolean taxDeductible) { this.taxDeductible = taxDeductible; }

    public WithholdingInfo getWithholding() { return withholding; }
    public void setWithholding(WithholdingInfo withholding) { this.withholding = withholding; }

    public LocalDate getTransactionDate() { return transactionDate; }
    public void setTransactionDate(LocalDate transactionDate) { this.transactionDate = transactionDate; }

    public Boolean getTaxLiabilityUpdated() { return taxLiabilityUpdated; }
    public void setTaxLiabilityUpdated(Boolean taxLiabilityUpdated) { this.taxLiabilityUpdated = taxLiabilityUpdated; }

    public VaultSuggestion getVaultSuggestion() { return vaultSuggestion; }
    public void setVaultSuggestion(VaultSuggestion vaultSuggestion) { this.vaultSuggestion = vaultSuggestion; }
}

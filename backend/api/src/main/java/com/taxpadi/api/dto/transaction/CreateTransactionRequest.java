package com.taxpadi.api.dto.transaction;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class CreateTransactionRequest {

    @NotBlank(message = "Transaction type is required")
    private String type;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    private BigDecimal amount;

    private String category;

    @NotBlank(message = "Transaction date is required")
    private String transactionDate;
    private Boolean taxDeductible;
    private Boolean withholdingApplicable;
    private String description;

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getTransactionDate() { return transactionDate; }
    public void setTransactionDate(String transactionDate) { this.transactionDate = transactionDate; }

    public Boolean getTaxDeductible() { return taxDeductible; }
    public void setTaxDeductible(Boolean taxDeductible) { this.taxDeductible = taxDeductible; }

    public Boolean getWithholdingApplicable() { return withholdingApplicable; }
    public void setWithholdingApplicable(Boolean withholdingApplicable) { this.withholdingApplicable = withholdingApplicable; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}

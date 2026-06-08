package com.taxpadi.api.dto.transaction;

import java.math.BigDecimal;

public class CreateTransactionRequest {

    private String type;
    private BigDecimal amount;
    private String category;
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

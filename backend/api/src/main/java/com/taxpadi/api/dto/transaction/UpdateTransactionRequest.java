package com.taxpadi.api.dto.transaction;

import java.math.BigDecimal;

public class UpdateTransactionRequest {

    private BigDecimal amount;
    private String category;
    private String description;
    private Boolean taxDeductible;
    private Boolean withholdingApplicable;
    private String transactionDate;

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Boolean getTaxDeductible() { return taxDeductible; }
    public void setTaxDeductible(Boolean taxDeductible) { this.taxDeductible = taxDeductible; }

    public Boolean getWithholdingApplicable() { return withholdingApplicable; }
    public void setWithholdingApplicable(Boolean withholdingApplicable) { this.withholdingApplicable = withholdingApplicable; }

    public String getTransactionDate() { return transactionDate; }
    public void setTransactionDate(String transactionDate) { this.transactionDate = transactionDate; }
}

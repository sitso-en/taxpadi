package com.taxpadi.api.dto.tax;

import java.time.LocalDateTime;
import java.util.List;

public class TaxBracketsResponse {

    private int taxYear;
    private String currency;
    private List<TaxBracketDto> incomeTaxBrackets;
    private LocalDateTime lastUpdated;

    public int getTaxYear() { return taxYear; }
    public void setTaxYear(int taxYear) { this.taxYear = taxYear; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public List<TaxBracketDto> getIncomeTaxBrackets() { return incomeTaxBrackets; }
    public void setIncomeTaxBrackets(List<TaxBracketDto> incomeTaxBrackets) { this.incomeTaxBrackets = incomeTaxBrackets; }

    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
}

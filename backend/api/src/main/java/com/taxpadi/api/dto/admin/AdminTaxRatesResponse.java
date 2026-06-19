package com.taxpadi.api.dto.admin;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.taxpadi.api.dto.tax.TaxRatesResponse;

import java.time.LocalDateTime;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class AdminTaxRatesResponse {

    private int taxYear;
    private LocalDateTime lastUpdated;
    private UUID updatedBy;
    private TaxRatesResponse rates;

    public int getTaxYear() { return taxYear; }
    public void setTaxYear(int taxYear) { this.taxYear = taxYear; }

    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }

    public UUID getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(UUID updatedBy) { this.updatedBy = updatedBy; }

    public TaxRatesResponse getRates() { return rates; }
    public void setRates(TaxRatesResponse rates) { this.rates = rates; }
}

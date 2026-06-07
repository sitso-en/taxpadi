package com.taxpadi.api.dto.tax;

import java.time.LocalDateTime;

public class TaxRatesResponse {

    private int taxYear;
    private String currency;
    private IncomeTaxRateInfo incomeTax;
    private VatRateInfo vat;
    private PayeRateInfo paye;
    private WithholdingRatesInfo withholding;
    private PenaltiesInfo penalties;
    private LocalDateTime lastUpdated;

    public int getTaxYear() { return taxYear; }
    public void setTaxYear(int taxYear) { this.taxYear = taxYear; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public IncomeTaxRateInfo getIncomeTax() { return incomeTax; }
    public void setIncomeTax(IncomeTaxRateInfo incomeTax) { this.incomeTax = incomeTax; }

    public VatRateInfo getVat() { return vat; }
    public void setVat(VatRateInfo vat) { this.vat = vat; }

    public PayeRateInfo getPaye() { return paye; }
    public void setPaye(PayeRateInfo paye) { this.paye = paye; }

    public WithholdingRatesInfo getWithholding() { return withholding; }
    public void setWithholding(WithholdingRatesInfo withholding) { this.withholding = withholding; }

    public PenaltiesInfo getPenalties() { return penalties; }
    public void setPenalties(PenaltiesInfo penalties) { this.penalties = penalties; }

    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
}

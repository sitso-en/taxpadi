package com.taxpadi.api.dto.admin;

import com.taxpadi.api.dto.tax.TaxBracketDto;
import com.taxpadi.api.dto.tax.WhtRateDto;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

public class AdminUpdateTaxRatesRequest {

    @NotNull
    private Integer taxYear;

    private List<TaxBracketDto> incomeTaxBrackets;
    private BigDecimal vatStandardRate;
    private BigDecimal vatNhilLevy;
    private BigDecimal vatGetfundLevy;
    private BigDecimal vatCovidLevy;
    private BigDecimal vatRegistrationThreshold;
    private List<WhtRateDto> withholdingRates;

    public Integer getTaxYear() { return taxYear; }
    public void setTaxYear(Integer taxYear) { this.taxYear = taxYear; }

    public List<TaxBracketDto> getIncomeTaxBrackets() { return incomeTaxBrackets; }
    public void setIncomeTaxBrackets(List<TaxBracketDto> incomeTaxBrackets) { this.incomeTaxBrackets = incomeTaxBrackets; }

    public BigDecimal getVatStandardRate() { return vatStandardRate; }
    public void setVatStandardRate(BigDecimal vatStandardRate) { this.vatStandardRate = vatStandardRate; }

    public BigDecimal getVatNhilLevy() { return vatNhilLevy; }
    public void setVatNhilLevy(BigDecimal vatNhilLevy) { this.vatNhilLevy = vatNhilLevy; }

    public BigDecimal getVatGetfundLevy() { return vatGetfundLevy; }
    public void setVatGetfundLevy(BigDecimal vatGetfundLevy) { this.vatGetfundLevy = vatGetfundLevy; }

    public BigDecimal getVatCovidLevy() { return vatCovidLevy; }
    public void setVatCovidLevy(BigDecimal vatCovidLevy) { this.vatCovidLevy = vatCovidLevy; }

    public BigDecimal getVatRegistrationThreshold() { return vatRegistrationThreshold; }
    public void setVatRegistrationThreshold(BigDecimal vatRegistrationThreshold) { this.vatRegistrationThreshold = vatRegistrationThreshold; }

    public List<WhtRateDto> getWithholdingRates() { return withholdingRates; }
    public void setWithholdingRates(List<WhtRateDto> withholdingRates) { this.withholdingRates = withholdingRates; }
}

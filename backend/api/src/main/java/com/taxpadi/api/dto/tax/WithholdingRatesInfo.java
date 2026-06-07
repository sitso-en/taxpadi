package com.taxpadi.api.dto.tax;

import java.util.List;

public class WithholdingRatesInfo {

    private List<WhtRateDto> rates;

    public WithholdingRatesInfo(List<WhtRateDto> rates) {
        this.rates = rates;
    }

    public List<WhtRateDto> getRates() { return rates; }
    public void setRates(List<WhtRateDto> rates) { this.rates = rates; }
}

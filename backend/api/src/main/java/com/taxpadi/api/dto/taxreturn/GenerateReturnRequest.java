package com.taxpadi.api.dto.taxreturn;

public class GenerateReturnRequest {

    private String taxType;
    private Integer taxYear;
    private Integer month;

    public String getTaxType() { return taxType; }
    public void setTaxType(String taxType) { this.taxType = taxType; }
    public Integer getTaxYear() { return taxYear; }
    public void setTaxYear(Integer taxYear) { this.taxYear = taxYear; }
    public Integer getMonth() { return month; }
    public void setMonth(Integer month) { this.month = month; }
}

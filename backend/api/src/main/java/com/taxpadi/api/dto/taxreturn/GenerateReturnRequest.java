package com.taxpadi.api.dto.taxreturn;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class GenerateReturnRequest {

    @NotBlank(message = "Tax type is required")
    private String taxType;

    @NotNull(message = "Tax year is required")
    @Min(value = 2000, message = "Tax year must be 2000 or later")
    private Integer taxYear;
    private Integer month;

    public String getTaxType() { return taxType; }
    public void setTaxType(String taxType) { this.taxType = taxType; }
    public Integer getTaxYear() { return taxYear; }
    public void setTaxYear(Integer taxYear) { this.taxYear = taxYear; }
    public Integer getMonth() { return month; }
    public void setMonth(Integer month) { this.month = month; }
}

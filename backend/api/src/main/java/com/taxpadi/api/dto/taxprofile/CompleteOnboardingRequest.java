package com.taxpadi.api.dto.taxprofile;

import com.fasterxml.jackson.annotation.JsonProperty;

public class CompleteOnboardingRequest {
    @JsonProperty("tax_year_start")
    private String taxYearStart;

    private String tin;

    public String getTaxYearStart() { return taxYearStart; }
    public void setTaxYearStart(String v) { this.taxYearStart = v; }

    public String getTin() { return tin; }
    public void setTin(String v) { this.tin = v; }
}

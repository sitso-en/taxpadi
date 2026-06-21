package com.taxpadi.api.dto.taxprofile;

import com.fasterxml.jackson.annotation.JsonProperty;

public class UpdateTaxProfileRequest {
    @JsonProperty("vat_registration_no")
    private String vatRegistrationNo;

    @JsonProperty("nhil_registered")
    private Boolean nhilRegistered;

    @JsonProperty("tax_year_start")
    private String taxYearStart;

    public String getVatRegistrationNo() { return vatRegistrationNo; }
    public void setVatRegistrationNo(String v) { this.vatRegistrationNo = v; }

    public Boolean getNhilRegistered() { return nhilRegistered; }
    public void setNhilRegistered(Boolean v) { this.nhilRegistered = v; }

    public String getTaxYearStart() { return taxYearStart; }
    public void setTaxYearStart(String v) { this.taxYearStart = v; }
}

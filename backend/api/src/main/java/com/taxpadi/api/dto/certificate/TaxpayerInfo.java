package com.taxpadi.api.dto.certificate;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class TaxpayerInfo {

    private String fullName;
    private String tin;
    private String phone;

    public TaxpayerInfo(String fullName, String tin, String phone) {
        this.fullName = fullName;
        this.tin = tin;
        this.phone = phone;
    }

    public String getFullName() { return fullName; }
    public String getTin() { return tin; }
    public String getPhone() { return phone; }
}

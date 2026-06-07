package com.taxpadi.api.dto.taxreturn;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class TaxpayerInfo {

    private String fullName;
    private String tin;
    private String phone;
    private String region;
    private String taxpayerCategory;

    public TaxpayerInfo(String fullName, String tin, String phone, String region, String taxpayerCategory) {
        this.fullName = fullName;
        this.tin = tin;
        this.phone = phone;
        this.region = region;
        this.taxpayerCategory = taxpayerCategory;
    }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getTin() { return tin; }
    public void setTin(String tin) { this.tin = tin; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }

    public String getTaxpayerCategory() { return taxpayerCategory; }
    public void setTaxpayerCategory(String taxpayerCategory) { this.taxpayerCategory = taxpayerCategory; }
}

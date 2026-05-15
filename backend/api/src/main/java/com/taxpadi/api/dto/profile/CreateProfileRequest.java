package com.taxpadi.api.dto.profile;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDate;

public class CreateProfileRequest {

    @NotBlank
    private String label;

    @NotNull
    @Pattern(regexp = "individual|sole_trader|small_business")
    private String taxpayerCategory;

    private String tin;
    private LocalDate taxYearStart;

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public String getTaxpayerCategory() { return taxpayerCategory; }
    public void setTaxpayerCategory(String taxpayerCategory) { this.taxpayerCategory = taxpayerCategory; }

    public String getTin() { return tin; }
    public void setTin(String tin) { this.tin = tin; }

    public LocalDate getTaxYearStart() { return taxYearStart; }
    public void setTaxYearStart(LocalDate taxYearStart) { this.taxYearStart = taxYearStart; }
}

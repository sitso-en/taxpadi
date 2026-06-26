package com.taxpadi.api.dto.profile;

import java.time.LocalDate;

public class UpdateProfileRequest {
    private String label;
    private LocalDate taxYearStart;
    private String tin;

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public LocalDate getTaxYearStart() { return taxYearStart; }
    public void setTaxYearStart(LocalDate taxYearStart) { this.taxYearStart = taxYearStart; }

    public String getTin() { return tin; }
    public void setTin(String tin) { this.tin = tin; }
}

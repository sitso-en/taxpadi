package com.taxpadi.api.dto.taxreturn;

import java.time.LocalDate;

public class ReturnDetails {

    private String taxType;
    private int taxYear;
    private LocalDate periodStart;
    private LocalDate periodEnd;

    public ReturnDetails(String taxType, int taxYear, LocalDate periodStart, LocalDate periodEnd) {
        this.taxType = taxType;
        this.taxYear = taxYear;
        this.periodStart = periodStart;
        this.periodEnd = periodEnd;
    }

    public String getTaxType() { return taxType; }
    public void setTaxType(String taxType) { this.taxType = taxType; }

    public int getTaxYear() { return taxYear; }
    public void setTaxYear(int taxYear) { this.taxYear = taxYear; }

    public LocalDate getPeriodStart() { return periodStart; }
    public void setPeriodStart(LocalDate periodStart) { this.periodStart = periodStart; }

    public LocalDate getPeriodEnd() { return periodEnd; }
    public void setPeriodEnd(LocalDate periodEnd) { this.periodEnd = periodEnd; }
}

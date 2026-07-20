package com.taxpadi.api.dto.deadline;

import java.time.LocalDate;

public class CompleteDeadlineRequest {
    private String taxType;
    private LocalDate periodStart;
    private LocalDate periodEnd;

    public String getTaxType() { return taxType; }
    public void setTaxType(String v) { this.taxType = v; }
    public LocalDate getPeriodStart() { return periodStart; }
    public void setPeriodStart(LocalDate v) { this.periodStart = v; }
    public LocalDate getPeriodEnd() { return periodEnd; }
    public void setPeriodEnd(LocalDate v) { this.periodEnd = v; }
}

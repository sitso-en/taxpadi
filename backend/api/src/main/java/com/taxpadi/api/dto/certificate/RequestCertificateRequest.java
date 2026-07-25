package com.taxpadi.api.dto.certificate;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public class RequestCertificateRequest {

    @NotBlank(message = "Tax type is required")
    private String taxType;

    private LocalDate periodStart;
    private LocalDate periodEnd;

    public String getTaxType() { return taxType; }
    public void setTaxType(String taxType) { this.taxType = taxType; }

    public LocalDate getPeriodStart() { return periodStart; }
    public void setPeriodStart(LocalDate periodStart) { this.periodStart = periodStart; }

    public LocalDate getPeriodEnd() { return periodEnd; }
    public void setPeriodEnd(LocalDate periodEnd) { this.periodEnd = periodEnd; }
}

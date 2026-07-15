package com.taxpadi.api.dto.payment;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDate;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class LinkedReturnInfo {
    @JsonProperty("return_id")
    private UUID returnId;

    @JsonProperty("tax_type")
    private String taxType;

    @JsonProperty("tax_year")
    private Integer taxYear;

    @JsonProperty("period_start")
    private LocalDate periodStart;

    @JsonProperty("period_end")
    private LocalDate periodEnd;

    public UUID getReturnId() { return returnId; }
    public void setReturnId(UUID v) { this.returnId = v; }

    public String getTaxType() { return taxType; }
    public void setTaxType(String v) { this.taxType = v; }

    public Integer getTaxYear() { return taxYear; }
    public void setTaxYear(Integer v) { this.taxYear = v; }

    public LocalDate getPeriodStart() { return periodStart; }
    public void setPeriodStart(LocalDate v) { this.periodStart = v; }

    public LocalDate getPeriodEnd() { return periodEnd; }
    public void setPeriodEnd(LocalDate v) { this.periodEnd = v; }
}

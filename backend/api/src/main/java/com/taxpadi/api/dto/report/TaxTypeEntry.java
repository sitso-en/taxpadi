package com.taxpadi.api.dto.report;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class TaxTypeEntry {

    private String taxType;
    private String returnStatus;
    private BigDecimal taxLiability;
    private BigDecimal amountPaid;
    private LocalDateTime filedOn;
    private LocalDateTime paidOn;
    private boolean compliant;

    public String getTaxType() { return taxType; }
    public void setTaxType(String taxType) { this.taxType = taxType; }

    public String getReturnStatus() { return returnStatus; }
    public void setReturnStatus(String returnStatus) { this.returnStatus = returnStatus; }

    public BigDecimal getTaxLiability() { return taxLiability; }
    public void setTaxLiability(BigDecimal taxLiability) { this.taxLiability = taxLiability; }

    public BigDecimal getAmountPaid() { return amountPaid; }
    public void setAmountPaid(BigDecimal amountPaid) { this.amountPaid = amountPaid; }

    public LocalDateTime getFiledOn() { return filedOn; }
    public void setFiledOn(LocalDateTime filedOn) { this.filedOn = filedOn; }

    public LocalDateTime getPaidOn() { return paidOn; }
    public void setPaidOn(LocalDateTime paidOn) { this.paidOn = paidOn; }

    public boolean isCompliant() { return compliant; }
    public void setCompliant(boolean compliant) { this.compliant = compliant; }
}

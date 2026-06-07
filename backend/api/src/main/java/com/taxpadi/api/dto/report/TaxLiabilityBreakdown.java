package com.taxpadi.api.dto.report;

import java.math.BigDecimal;

public class TaxLiabilityBreakdown {

    private BigDecimal incomeTax;
    private BigDecimal vat;
    private BigDecimal total;

    public TaxLiabilityBreakdown(BigDecimal incomeTax, BigDecimal vat, BigDecimal total) {
        this.incomeTax = incomeTax;
        this.vat = vat;
        this.total = total;
    }

    public BigDecimal getIncomeTax() { return incomeTax; }
    public void setIncomeTax(BigDecimal incomeTax) { this.incomeTax = incomeTax; }

    public BigDecimal getVat() { return vat; }
    public void setVat(BigDecimal vat) { this.vat = vat; }

    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }
}

package com.taxpadi.api.dto.withholding;

import java.math.BigDecimal;

public class WhtSummary {

    private BigDecimal totalWithheld;
    private BigDecimal totalRemitted;
    private BigDecimal totalOutstanding;

    public BigDecimal getTotalWithheld() { return totalWithheld; }
    public void setTotalWithheld(BigDecimal totalWithheld) { this.totalWithheld = totalWithheld; }

    public BigDecimal getTotalRemitted() { return totalRemitted; }
    public void setTotalRemitted(BigDecimal totalRemitted) { this.totalRemitted = totalRemitted; }

    public BigDecimal getTotalOutstanding() { return totalOutstanding; }
    public void setTotalOutstanding(BigDecimal totalOutstanding) { this.totalOutstanding = totalOutstanding; }
}

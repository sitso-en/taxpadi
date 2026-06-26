package com.taxpadi.api.dto.paye;

import java.math.BigDecimal;

public class PayeSummaryDto {

    private BigDecimal totalPayeDeducted;
    private BigDecimal totalRemitted;
    private BigDecimal totalOutstanding;

    public PayeSummaryDto(BigDecimal totalPayeDeducted, BigDecimal totalRemitted, BigDecimal totalOutstanding) {
        this.totalPayeDeducted = totalPayeDeducted;
        this.totalRemitted = totalRemitted;
        this.totalOutstanding = totalOutstanding;
    }

    public BigDecimal getTotalPayeDeducted() { return totalPayeDeducted; }
    public void setTotalPayeDeducted(BigDecimal totalPayeDeducted) { this.totalPayeDeducted = totalPayeDeducted; }

    public BigDecimal getTotalRemitted() { return totalRemitted; }
    public void setTotalRemitted(BigDecimal totalRemitted) { this.totalRemitted = totalRemitted; }

    public BigDecimal getTotalOutstanding() { return totalOutstanding; }
    public void setTotalOutstanding(BigDecimal totalOutstanding) { this.totalOutstanding = totalOutstanding; }
}

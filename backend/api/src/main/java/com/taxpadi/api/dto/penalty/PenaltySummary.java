package com.taxpadi.api.dto.penalty;

import java.math.BigDecimal;

public class PenaltySummary {

    private long totalActivePenalties;
    private BigDecimal totalOutstanding;
    private BigDecimal totalResolved;

    public PenaltySummary(long totalActivePenalties, BigDecimal totalOutstanding, BigDecimal totalResolved) {
        this.totalActivePenalties = totalActivePenalties;
        this.totalOutstanding = totalOutstanding;
        this.totalResolved = totalResolved;
    }

    public long getTotalActivePenalties() { return totalActivePenalties; }
    public BigDecimal getTotalOutstanding() { return totalOutstanding; }
    public BigDecimal getTotalResolved() { return totalResolved; }
}

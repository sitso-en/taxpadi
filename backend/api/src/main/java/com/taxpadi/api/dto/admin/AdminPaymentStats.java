package com.taxpadi.api.dto.admin;

import java.math.BigDecimal;

public class AdminPaymentStats {

    private long totalProcessed;
    private BigDecimal totalAmountProcessed;
    private long processedThisMonth;

    public AdminPaymentStats(long totalProcessed, BigDecimal totalAmountProcessed, long processedThisMonth) {
        this.totalProcessed = totalProcessed;
        this.totalAmountProcessed = totalAmountProcessed;
        this.processedThisMonth = processedThisMonth;
    }

    public long getTotalProcessed() { return totalProcessed; }
    public BigDecimal getTotalAmountProcessed() { return totalAmountProcessed; }
    public long getProcessedThisMonth() { return processedThisMonth; }
}

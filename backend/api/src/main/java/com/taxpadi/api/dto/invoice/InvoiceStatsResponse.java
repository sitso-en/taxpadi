package com.taxpadi.api.dto.invoice;

import java.math.BigDecimal;

public class InvoiceStatsResponse {

    private BigDecimal totalInvoiced;
    private BigDecimal totalPaid;
    private BigDecimal totalOutstanding;
    private BigDecimal totalOverdue;
    private InvoiceCountDto invoiceCount;

    public BigDecimal getTotalInvoiced() { return totalInvoiced; }
    public void setTotalInvoiced(BigDecimal totalInvoiced) { this.totalInvoiced = totalInvoiced; }

    public BigDecimal getTotalPaid() { return totalPaid; }
    public void setTotalPaid(BigDecimal totalPaid) { this.totalPaid = totalPaid; }

    public BigDecimal getTotalOutstanding() { return totalOutstanding; }
    public void setTotalOutstanding(BigDecimal totalOutstanding) { this.totalOutstanding = totalOutstanding; }

    public BigDecimal getTotalOverdue() { return totalOverdue; }
    public void setTotalOverdue(BigDecimal totalOverdue) { this.totalOverdue = totalOverdue; }

    public InvoiceCountDto getInvoiceCount() { return invoiceCount; }
    public void setInvoiceCount(InvoiceCountDto invoiceCount) { this.invoiceCount = invoiceCount; }
}

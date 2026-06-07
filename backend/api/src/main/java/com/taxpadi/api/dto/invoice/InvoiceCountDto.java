package com.taxpadi.api.dto.invoice;

public class InvoiceCountDto {

    private long total;
    private long paid;
    private long unpaid;
    private long overdue;
    private long cancelled;

    public InvoiceCountDto(long total, long paid, long unpaid, long overdue, long cancelled) {
        this.total = total;
        this.paid = paid;
        this.unpaid = unpaid;
        this.overdue = overdue;
        this.cancelled = cancelled;
    }

    public long getTotal() { return total; }
    public void setTotal(long total) { this.total = total; }

    public long getPaid() { return paid; }
    public void setPaid(long paid) { this.paid = paid; }

    public long getUnpaid() { return unpaid; }
    public void setUnpaid(long unpaid) { this.unpaid = unpaid; }

    public long getOverdue() { return overdue; }
    public void setOverdue(long overdue) { this.overdue = overdue; }

    public long getCancelled() { return cancelled; }
    public void setCancelled(long cancelled) { this.cancelled = cancelled; }
}

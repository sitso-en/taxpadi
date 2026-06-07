package com.taxpadi.api.dto.paye;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class PayeRemitResponse {

    private UUID payeId;
    private String employeeName;
    private int month;
    private int year;
    private BigDecimal payeDeducted;
    private boolean remitted;
    private LocalDateTime remittedAt;

    public UUID getPayeId() { return payeId; }
    public void setPayeId(UUID payeId) { this.payeId = payeId; }

    public String getEmployeeName() { return employeeName; }
    public void setEmployeeName(String employeeName) { this.employeeName = employeeName; }

    public int getMonth() { return month; }
    public void setMonth(int month) { this.month = month; }

    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }

    public BigDecimal getPayeDeducted() { return payeDeducted; }
    public void setPayeDeducted(BigDecimal payeDeducted) { this.payeDeducted = payeDeducted; }

    public boolean isRemitted() { return remitted; }
    public void setRemitted(boolean remitted) { this.remitted = remitted; }

    public LocalDateTime getRemittedAt() { return remittedAt; }
    public void setRemittedAt(LocalDateTime remittedAt) { this.remittedAt = remittedAt; }
}

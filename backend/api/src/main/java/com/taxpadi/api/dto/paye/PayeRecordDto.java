package com.taxpadi.api.dto.paye;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class PayeRecordDto {

    private UUID payeId;
    private UUID employeeId;
    private String employeeName;
    private int month;
    private int year;
    private BigDecimal grossSalary;
    private BigDecimal taxableSalary;
    private BigDecimal payeDeducted;
    private boolean remitted;
    private LocalDateTime remittedAt;

    public PayeRecordDto(UUID payeId, UUID employeeId, String employeeName,
                         int month, int year, BigDecimal grossSalary, BigDecimal taxableSalary,
                         BigDecimal payeDeducted, boolean remitted, LocalDateTime remittedAt) {
        this.payeId = payeId;
        this.employeeId = employeeId;
        this.employeeName = employeeName;
        this.month = month;
        this.year = year;
        this.grossSalary = grossSalary;
        this.taxableSalary = taxableSalary;
        this.payeDeducted = payeDeducted;
        this.remitted = remitted;
        this.remittedAt = remittedAt;
    }

    public UUID getPayeId() { return payeId; }
    public UUID getEmployeeId() { return employeeId; }
    public String getEmployeeName() { return employeeName; }
    public int getMonth() { return month; }
    public int getYear() { return year; }
    public BigDecimal getGrossSalary() { return grossSalary; }
    public BigDecimal getTaxableSalary() { return taxableSalary; }
    public BigDecimal getPayeDeducted() { return payeDeducted; }
    public boolean isRemitted() { return remitted; }
    public LocalDateTime getRemittedAt() { return remittedAt; }
}

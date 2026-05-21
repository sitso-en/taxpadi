package com.taxpadi.api.dto.vat;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class VatRecordDto {

    private UUID vatId;
    private int month;
    private int year;
    private BigDecimal totalSales;
    private BigDecimal outputVat;
    private BigDecimal totalPurchases;
    private BigDecimal inputVat;
    private BigDecimal netVatLiability;
    private String returnStatus;
    private LocalDate dueDate;
    private LocalDateTime submittedAt;

    public VatRecordDto(UUID vatId, int month, int year, BigDecimal totalSales, BigDecimal outputVat,
                        BigDecimal totalPurchases, BigDecimal inputVat, BigDecimal netVatLiability,
                        String returnStatus, LocalDate dueDate, LocalDateTime submittedAt) {
        this.vatId = vatId;
        this.month = month;
        this.year = year;
        this.totalSales = totalSales;
        this.outputVat = outputVat;
        this.totalPurchases = totalPurchases;
        this.inputVat = inputVat;
        this.netVatLiability = netVatLiability;
        this.returnStatus = returnStatus;
        this.dueDate = dueDate;
        this.submittedAt = submittedAt;
    }

    public UUID getVatId() { return vatId; }
    public int getMonth() { return month; }
    public int getYear() { return year; }
    public BigDecimal getTotalSales() { return totalSales; }
    public BigDecimal getOutputVat() { return outputVat; }
    public BigDecimal getTotalPurchases() { return totalPurchases; }
    public BigDecimal getInputVat() { return inputVat; }
    public BigDecimal getNetVatLiability() { return netVatLiability; }
    public String getReturnStatus() { return returnStatus; }
    public LocalDate getDueDate() { return dueDate; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
}

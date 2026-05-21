package com.taxpadi.api.dto.vat;

import java.math.BigDecimal;
import java.time.LocalDate;

public class VatRegisterResponse {

    private int month;
    private int year;
    private BigDecimal totalSales;
    private BigDecimal outputVat;
    private BigDecimal totalPurchases;
    private BigDecimal inputVat;
    private BigDecimal netVatLiability;
    private String effectiveRate;
    private String returnStatus;
    private LocalDate dueDate;

    public VatRegisterResponse(int month, int year, BigDecimal totalSales, BigDecimal outputVat,
                               BigDecimal totalPurchases, BigDecimal inputVat, BigDecimal netVatLiability,
                               String effectiveRate, String returnStatus, LocalDate dueDate) {
        this.month = month;
        this.year = year;
        this.totalSales = totalSales;
        this.outputVat = outputVat;
        this.totalPurchases = totalPurchases;
        this.inputVat = inputVat;
        this.netVatLiability = netVatLiability;
        this.effectiveRate = effectiveRate;
        this.returnStatus = returnStatus;
        this.dueDate = dueDate;
    }

    public int getMonth() { return month; }
    public int getYear() { return year; }
    public BigDecimal getTotalSales() { return totalSales; }
    public BigDecimal getOutputVat() { return outputVat; }
    public BigDecimal getTotalPurchases() { return totalPurchases; }
    public BigDecimal getInputVat() { return inputVat; }
    public BigDecimal getNetVatLiability() { return netVatLiability; }
    public String getEffectiveRate() { return effectiveRate; }
    public String getReturnStatus() { return returnStatus; }
    public LocalDate getDueDate() { return dueDate; }
}

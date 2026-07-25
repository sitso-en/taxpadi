package com.taxpadi.api.dto.vat;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class VatStatusResponse {

    private int month;
    private int year;
    private BigDecimal totalSales;
    private BigDecimal outputVat;
    private BigDecimal totalPurchases;
    private BigDecimal inputVat;
    private BigDecimal nhil;
    private BigDecimal getfund;
    private BigDecimal netVatLiability;
    private String returnStatus;
    private LocalDate dueDate;
    private LocalDateTime submittedAt;
    private String thresholdWarning;
    private boolean vatRegistered;

    public VatStatusResponse(int month, int year, BigDecimal totalSales, BigDecimal outputVat,
                             BigDecimal totalPurchases, BigDecimal inputVat, BigDecimal nhil,
                             BigDecimal getfund, BigDecimal netVatLiability,
                             String returnStatus, LocalDate dueDate, LocalDateTime submittedAt,
                             String thresholdWarning, boolean vatRegistered) {
        this.month = month;
        this.year = year;
        this.totalSales = totalSales;
        this.outputVat = outputVat;
        this.totalPurchases = totalPurchases;
        this.inputVat = inputVat;
        this.nhil = nhil;
        this.getfund = getfund;
        this.netVatLiability = netVatLiability;
        this.returnStatus = returnStatus;
        this.dueDate = dueDate;
        this.submittedAt = submittedAt;
        this.thresholdWarning = thresholdWarning;
        this.vatRegistered = vatRegistered;
    }

    public int getMonth() { return month; }
    public int getYear() { return year; }
    public BigDecimal getTotalSales() { return totalSales; }
    public BigDecimal getOutputVat() { return outputVat; }
    public BigDecimal getTotalPurchases() { return totalPurchases; }
    public BigDecimal getInputVat() { return inputVat; }
    public BigDecimal getNhil() { return nhil; }
    public BigDecimal getGetfund() { return getfund; }
    public BigDecimal getNetVatLiability() { return netVatLiability; }
    public String getReturnStatus() { return returnStatus; }
    public LocalDate getDueDate() { return dueDate; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public String getThresholdWarning() { return thresholdWarning; }
    public boolean getVatRegistered() { return vatRegistered; }
}

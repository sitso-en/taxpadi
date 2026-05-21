package com.taxpadi.api.dto.vat;

import java.math.BigDecimal;

public class VatRegisterRequest {

    private Integer month;
    private Integer year;
    private BigDecimal totalSales;
    private BigDecimal totalPurchases;
    private BigDecimal inputVat;

    public Integer getMonth() { return month; }
    public void setMonth(Integer month) { this.month = month; }
    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }
    public BigDecimal getTotalSales() { return totalSales; }
    public void setTotalSales(BigDecimal totalSales) { this.totalSales = totalSales; }
    public BigDecimal getTotalPurchases() { return totalPurchases; }
    public void setTotalPurchases(BigDecimal totalPurchases) { this.totalPurchases = totalPurchases; }
    public BigDecimal getInputVat() { return inputVat; }
    public void setInputVat(BigDecimal inputVat) { this.inputVat = inputVat; }
}

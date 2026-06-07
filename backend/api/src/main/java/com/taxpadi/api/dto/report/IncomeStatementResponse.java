package com.taxpadi.api.dto.report;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class IncomeStatementResponse {

    private UUID statementId;
    private LocalDate periodStart;
    private LocalDate periodEnd;
    private int monthsCovered;
    private TaxpayerSummary taxpayer;
    private List<MonthlySummaryItem> monthlySummary;
    private Averages averages;
    private TaxCompliance taxCompliance;
    private String pdfUrl;
    private LocalDateTime generatedAt;

    public UUID getStatementId() { return statementId; }
    public void setStatementId(UUID statementId) { this.statementId = statementId; }

    public LocalDate getPeriodStart() { return periodStart; }
    public void setPeriodStart(LocalDate periodStart) { this.periodStart = periodStart; }

    public LocalDate getPeriodEnd() { return periodEnd; }
    public void setPeriodEnd(LocalDate periodEnd) { this.periodEnd = periodEnd; }

    public int getMonthsCovered() { return monthsCovered; }
    public void setMonthsCovered(int monthsCovered) { this.monthsCovered = monthsCovered; }

    public TaxpayerSummary getTaxpayer() { return taxpayer; }
    public void setTaxpayer(TaxpayerSummary taxpayer) { this.taxpayer = taxpayer; }

    public List<MonthlySummaryItem> getMonthlySummary() { return monthlySummary; }
    public void setMonthlySummary(List<MonthlySummaryItem> monthlySummary) { this.monthlySummary = monthlySummary; }

    public Averages getAverages() { return averages; }
    public void setAverages(Averages averages) { this.averages = averages; }

    public TaxCompliance getTaxCompliance() { return taxCompliance; }
    public void setTaxCompliance(TaxCompliance taxCompliance) { this.taxCompliance = taxCompliance; }

    public String getPdfUrl() { return pdfUrl; }
    public void setPdfUrl(String pdfUrl) { this.pdfUrl = pdfUrl; }

    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }
}

package com.taxpadi.api.dto.penalty;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class PenaltyDetailDto {

    private UUID penaltyId;
    private String taxType;
    private LocalDate deadlineDate;
    private LocalDate filingDate;
    private int daysLate;
    private BigDecimal totalPenalty;
    private BigDecimal dailyRate;
    private BigDecimal penaltyGrowsByDaily;
    private boolean resolved;
    private LocalDateTime resolvedAt;
    private PenaltyGuidance guidance;

    public UUID getPenaltyId() { return penaltyId; }
    public void setPenaltyId(UUID v) { this.penaltyId = v; }
    public String getTaxType() { return taxType; }
    public void setTaxType(String v) { this.taxType = v; }
    public LocalDate getDeadlineDate() { return deadlineDate; }
    public void setDeadlineDate(LocalDate v) { this.deadlineDate = v; }
    public LocalDate getFilingDate() { return filingDate; }
    public void setFilingDate(LocalDate v) { this.filingDate = v; }
    public int getDaysLate() { return daysLate; }
    public void setDaysLate(int v) { this.daysLate = v; }
    public BigDecimal getTotalPenalty() { return totalPenalty; }
    public void setTotalPenalty(BigDecimal v) { this.totalPenalty = v; }
    public BigDecimal getDailyRate() { return dailyRate; }
    public void setDailyRate(BigDecimal v) { this.dailyRate = v; }
    public BigDecimal getPenaltyGrowsByDaily() { return penaltyGrowsByDaily; }
    public void setPenaltyGrowsByDaily(BigDecimal v) { this.penaltyGrowsByDaily = v; }
    public boolean isResolved() { return resolved; }
    public void setResolved(boolean v) { this.resolved = v; }
    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime v) { this.resolvedAt = v; }
    public PenaltyGuidance getGuidance() { return guidance; }
    public void setGuidance(PenaltyGuidance v) { this.guidance = v; }
}

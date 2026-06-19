package com.taxpadi.api.dto.penalty;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class PenaltyPreviewDto {

    private String taxType;
    private LocalDate deadlineDate;
    private int daysLate;
    private BigDecimal basePenalty;
    private BigDecimal dailyPenalty;
    private BigDecimal interestAmount;
    private BigDecimal totalPenalty;
    private boolean penaltyActive;
    private UUID existingPenaltyId;

    public String getTaxType() { return taxType; }
    public void setTaxType(String v) { this.taxType = v; }
    public LocalDate getDeadlineDate() { return deadlineDate; }
    public void setDeadlineDate(LocalDate v) { this.deadlineDate = v; }
    public int getDaysLate() { return daysLate; }
    public void setDaysLate(int v) { this.daysLate = v; }
    public BigDecimal getBasePenalty() { return basePenalty; }
    public void setBasePenalty(BigDecimal v) { this.basePenalty = v; }
    public BigDecimal getDailyPenalty() { return dailyPenalty; }
    public void setDailyPenalty(BigDecimal v) { this.dailyPenalty = v; }
    public BigDecimal getInterestAmount() { return interestAmount; }
    public void setInterestAmount(BigDecimal v) { this.interestAmount = v; }
    public BigDecimal getTotalPenalty() { return totalPenalty; }
    public void setTotalPenalty(BigDecimal v) { this.totalPenalty = v; }
    public boolean isPenaltyActive() { return penaltyActive; }
    public void setPenaltyActive(boolean v) { this.penaltyActive = v; }
    public UUID getExistingPenaltyId() { return existingPenaltyId; }
    public void setExistingPenaltyId(UUID v) { this.existingPenaltyId = v; }
}

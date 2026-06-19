package com.taxpadi.api.dto.deadline;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDate;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class TaxDeadlineDto {

    private UUID deadlineId;
    private String taxType;
    private String title;
    private String description;
    private LocalDate deadlineDate;
    private long daysUntilDue;
    private boolean completed;
    private String urgency;

    public UUID getDeadlineId() { return deadlineId; }
    public void setDeadlineId(UUID v) { this.deadlineId = v; }
    public String getTaxType() { return taxType; }
    public void setTaxType(String v) { this.taxType = v; }
    public String getTitle() { return title; }
    public void setTitle(String v) { this.title = v; }
    public String getDescription() { return description; }
    public void setDescription(String v) { this.description = v; }
    public LocalDate getDeadlineDate() { return deadlineDate; }
    public void setDeadlineDate(LocalDate v) { this.deadlineDate = v; }
    public long getDaysUntilDue() { return daysUntilDue; }
    public void setDaysUntilDue(long v) { this.daysUntilDue = v; }
    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean v) { this.completed = v; }
    public String getUrgency() { return urgency; }
    public void setUrgency(String v) { this.urgency = v; }
}

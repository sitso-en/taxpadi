package com.taxpadi.api.dto.deadline;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class CompleteDeadlineResponse {

    private UUID deadlineId;
    private String taxType;
    private String description;
    private LocalDate deadlineDate;
    private boolean completed;
    private LocalDateTime completedAt;

    public UUID getDeadlineId() { return deadlineId; }
    public void setDeadlineId(UUID v) { this.deadlineId = v; }
    public String getTaxType() { return taxType; }
    public void setTaxType(String v) { this.taxType = v; }
    public String getDescription() { return description; }
    public void setDescription(String v) { this.description = v; }
    public LocalDate getDeadlineDate() { return deadlineDate; }
    public void setDeadlineDate(LocalDate v) { this.deadlineDate = v; }
    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean v) { this.completed = v; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime v) { this.completedAt = v; }
}

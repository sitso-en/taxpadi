package com.taxpadi.api.dto.paye;

import java.time.LocalDate;
import java.util.UUID;

public class DeactivateEmployeeResponse {

    private UUID employeeId;
    private String fullName;
    private boolean isActive;
    private LocalDate endDate;

    public UUID getEmployeeId() { return employeeId; }
    public void setEmployeeId(UUID employeeId) { this.employeeId = employeeId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
}

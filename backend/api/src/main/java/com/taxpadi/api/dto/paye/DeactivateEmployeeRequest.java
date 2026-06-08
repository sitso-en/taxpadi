package com.taxpadi.api.dto.paye;

import java.time.LocalDate;

public class DeactivateEmployeeRequest {

    private LocalDate endDate;

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
}

package com.taxpadi.api.dto.paye;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class AddEmployeeResponse {

    private UUID employeeId;
    private String fullName;
    private BigDecimal grossSalary;
    private BigDecimal monthlyPaye;
    private boolean ssnitWarning;
    private LocalDateTime createdAt;

    public UUID getEmployeeId() { return employeeId; }
    public void setEmployeeId(UUID employeeId) { this.employeeId = employeeId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public BigDecimal getGrossSalary() { return grossSalary; }
    public void setGrossSalary(BigDecimal grossSalary) { this.grossSalary = grossSalary; }

    public BigDecimal getMonthlyPaye() { return monthlyPaye; }
    public void setMonthlyPaye(BigDecimal monthlyPaye) { this.monthlyPaye = monthlyPaye; }

    public boolean isSsnitWarning() { return ssnitWarning; }
    public void setSsnitWarning(boolean ssnitWarning) { this.ssnitWarning = ssnitWarning; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

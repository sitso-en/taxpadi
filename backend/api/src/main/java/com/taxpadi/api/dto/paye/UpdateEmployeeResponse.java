package com.taxpadi.api.dto.paye;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class UpdateEmployeeResponse {

    private UUID employeeId;
    private String fullName;
    private BigDecimal grossSalary;
    private BigDecimal monthlyPaye;
    private boolean payeRecalculated;
    private LocalDateTime updatedAt;

    public UUID getEmployeeId() { return employeeId; }
    public void setEmployeeId(UUID employeeId) { this.employeeId = employeeId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public BigDecimal getGrossSalary() { return grossSalary; }
    public void setGrossSalary(BigDecimal grossSalary) { this.grossSalary = grossSalary; }

    public BigDecimal getMonthlyPaye() { return monthlyPaye; }
    public void setMonthlyPaye(BigDecimal monthlyPaye) { this.monthlyPaye = monthlyPaye; }

    public boolean isPayeRecalculated() { return payeRecalculated; }
    public void setPayeRecalculated(boolean payeRecalculated) { this.payeRecalculated = payeRecalculated; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

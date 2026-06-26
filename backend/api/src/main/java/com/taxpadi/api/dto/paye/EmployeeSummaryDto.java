package com.taxpadi.api.dto.paye;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class EmployeeSummaryDto {

    private UUID employeeId;
    private String fullName;
    private String position;
    private BigDecimal grossSalary;
    private BigDecimal transportAllowance;
    private BigDecimal housingAllowance;
    private BigDecimal otherAllowances;
    private String socialSecurityNo;
    private LocalDate startDate;
    private boolean isActive;
    private BigDecimal monthlyPaye;
    private LocalDateTime createdAt;

    public EmployeeSummaryDto(UUID employeeId, String fullName, String position,
                               BigDecimal grossSalary, BigDecimal transportAllowance,
                               BigDecimal housingAllowance, BigDecimal otherAllowances,
                               String socialSecurityNo, LocalDate startDate,
                               boolean isActive, BigDecimal monthlyPaye, LocalDateTime createdAt) {
        this.employeeId = employeeId;
        this.fullName = fullName;
        this.position = position;
        this.grossSalary = grossSalary;
        this.transportAllowance = transportAllowance;
        this.housingAllowance = housingAllowance;
        this.otherAllowances = otherAllowances;
        this.socialSecurityNo = socialSecurityNo;
        this.startDate = startDate;
        this.isActive = isActive;
        this.monthlyPaye = monthlyPaye;
        this.createdAt = createdAt;
    }

    public UUID getEmployeeId() { return employeeId; }
    public String getFullName() { return fullName; }
    public String getPosition() { return position; }
    public BigDecimal getGrossSalary() { return grossSalary; }
    public BigDecimal getTransportAllowance() { return transportAllowance; }
    public BigDecimal getHousingAllowance() { return housingAllowance; }
    public BigDecimal getOtherAllowances() { return otherAllowances; }
    public String getSocialSecurityNo() { return socialSecurityNo; }
    public LocalDate getStartDate() { return startDate; }
    public boolean isActive() { return isActive; }
    public BigDecimal getMonthlyPaye() { return monthlyPaye; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}

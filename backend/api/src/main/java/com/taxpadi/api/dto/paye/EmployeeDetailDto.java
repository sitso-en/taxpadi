package com.taxpadi.api.dto.paye;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class EmployeeDetailDto {

    private UUID employeeId;
    private String fullName;
    private String position;
    private BigDecimal grossSalary;
    private BigDecimal transportAllowance;
    private BigDecimal housingAllowance;
    private BigDecimal otherAllowances;
    private String socialSecurityNo;
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean isActive;
    private BigDecimal monthlyPaye;
    private PayeSummary payeSummary;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public EmployeeDetailDto(UUID employeeId, String fullName, String position,
                              BigDecimal grossSalary, BigDecimal transportAllowance,
                              BigDecimal housingAllowance, BigDecimal otherAllowances,
                              String socialSecurityNo, LocalDate startDate, LocalDate endDate,
                              boolean isActive, BigDecimal monthlyPaye, PayeSummary payeSummary,
                              LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.employeeId = employeeId;
        this.fullName = fullName;
        this.position = position;
        this.grossSalary = grossSalary;
        this.transportAllowance = transportAllowance;
        this.housingAllowance = housingAllowance;
        this.otherAllowances = otherAllowances;
        this.socialSecurityNo = socialSecurityNo;
        this.startDate = startDate;
        this.endDate = endDate;
        this.isActive = isActive;
        this.monthlyPaye = monthlyPaye;
        this.payeSummary = payeSummary;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
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
    public LocalDate getEndDate() { return endDate; }
    public boolean isActive() { return isActive; }
    public BigDecimal getMonthlyPaye() { return monthlyPaye; }
    public PayeSummary getPayeSummary() { return payeSummary; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public static class PayeSummary {
        private int totalMonths;
        private BigDecimal totalPayeDeducted;
        private BigDecimal totalRemitted;
        private BigDecimal outstanding;

        public PayeSummary(int totalMonths, BigDecimal totalPayeDeducted,
                           BigDecimal totalRemitted, BigDecimal outstanding) {
            this.totalMonths = totalMonths;
            this.totalPayeDeducted = totalPayeDeducted;
            this.totalRemitted = totalRemitted;
            this.outstanding = outstanding;
        }

        public int getTotalMonths() { return totalMonths; }
        public BigDecimal getTotalPayeDeducted() { return totalPayeDeducted; }
        public BigDecimal getTotalRemitted() { return totalRemitted; }
        public BigDecimal getOutstanding() { return outstanding; }
    }
}

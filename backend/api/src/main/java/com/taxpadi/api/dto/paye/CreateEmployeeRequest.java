package com.taxpadi.api.dto.paye;

import java.math.BigDecimal;
import java.time.LocalDate;

public class CreateEmployeeRequest {

    private String fullName;
    private String position;
    private BigDecimal grossSalary;
    private BigDecimal transportAllowance;
    private BigDecimal housingAllowance;
    private BigDecimal otherAllowances;
    private String socialSecurityNo;
    private LocalDate startDate;

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }
    public BigDecimal getGrossSalary() { return grossSalary; }
    public void setGrossSalary(BigDecimal grossSalary) { this.grossSalary = grossSalary; }
    public BigDecimal getTransportAllowance() { return transportAllowance; }
    public void setTransportAllowance(BigDecimal transportAllowance) { this.transportAllowance = transportAllowance; }
    public BigDecimal getHousingAllowance() { return housingAllowance; }
    public void setHousingAllowance(BigDecimal housingAllowance) { this.housingAllowance = housingAllowance; }
    public BigDecimal getOtherAllowances() { return otherAllowances; }
    public void setOtherAllowances(BigDecimal otherAllowances) { this.otherAllowances = otherAllowances; }
    public String getSocialSecurityNo() { return socialSecurityNo; }
    public void setSocialSecurityNo(String socialSecurityNo) { this.socialSecurityNo = socialSecurityNo; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
}

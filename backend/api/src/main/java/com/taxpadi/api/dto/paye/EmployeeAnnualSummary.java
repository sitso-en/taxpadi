package com.taxpadi.api.dto.paye;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class EmployeeAnnualSummary {

    private UUID employeeId;
    private String fullName;
    private String socialSecurityNo;
    private List<MonthlyBreakdownItem> monthlyBreakdown;
    private AnnualTotals annualTotals;

    public UUID getEmployeeId() { return employeeId; }
    public void setEmployeeId(UUID employeeId) { this.employeeId = employeeId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getSocialSecurityNo() { return socialSecurityNo; }
    public void setSocialSecurityNo(String socialSecurityNo) { this.socialSecurityNo = socialSecurityNo; }

    public List<MonthlyBreakdownItem> getMonthlyBreakdown() { return monthlyBreakdown; }
    public void setMonthlyBreakdown(List<MonthlyBreakdownItem> monthlyBreakdown) { this.monthlyBreakdown = monthlyBreakdown; }

    public AnnualTotals getAnnualTotals() { return annualTotals; }
    public void setAnnualTotals(AnnualTotals annualTotals) { this.annualTotals = annualTotals; }
}

package com.taxpadi.api.dto.paye;

import java.time.LocalDate;
import java.util.List;

public class AnnualReturnResponse {

    private int year;
    private LocalDate submissionDeadline;
    private long daysUntilDeadline;
    private List<EmployeeAnnualSummary> employees;
    private GrandTotals grandTotals;
    private boolean readyForSubmission;

    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }

    public LocalDate getSubmissionDeadline() { return submissionDeadline; }
    public void setSubmissionDeadline(LocalDate submissionDeadline) { this.submissionDeadline = submissionDeadline; }

    public long getDaysUntilDeadline() { return daysUntilDeadline; }
    public void setDaysUntilDeadline(long daysUntilDeadline) { this.daysUntilDeadline = daysUntilDeadline; }

    public List<EmployeeAnnualSummary> getEmployees() { return employees; }
    public void setEmployees(List<EmployeeAnnualSummary> employees) { this.employees = employees; }

    public GrandTotals getGrandTotals() { return grandTotals; }
    public void setGrandTotals(GrandTotals grandTotals) { this.grandTotals = grandTotals; }

    public boolean isReadyForSubmission() { return readyForSubmission; }
    public void setReadyForSubmission(boolean readyForSubmission) { this.readyForSubmission = readyForSubmission; }
}

package com.taxpadi.api.dto.paye;

import java.time.LocalDate;
import java.util.List;

public class MonthlySummaryResponse {

    private int month;
    private int year;
    private LocalDate remittanceDueDate;
    private long daysUntilDue;
    private List<PayeRecordDto> employees;
    private PayeMonthlyTotals totals;

    public int getMonth() { return month; }
    public void setMonth(int month) { this.month = month; }

    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }

    public LocalDate getRemittanceDueDate() { return remittanceDueDate; }
    public void setRemittanceDueDate(LocalDate remittanceDueDate) { this.remittanceDueDate = remittanceDueDate; }

    public long getDaysUntilDue() { return daysUntilDue; }
    public void setDaysUntilDue(long daysUntilDue) { this.daysUntilDue = daysUntilDue; }

    public List<PayeRecordDto> getEmployees() { return employees; }
    public void setEmployees(List<PayeRecordDto> employees) { this.employees = employees; }

    public PayeMonthlyTotals getTotals() { return totals; }
    public void setTotals(PayeMonthlyTotals totals) { this.totals = totals; }
}

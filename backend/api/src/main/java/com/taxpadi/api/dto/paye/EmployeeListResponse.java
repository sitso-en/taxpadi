package com.taxpadi.api.dto.paye;

import com.taxpadi.api.dto.common.PaginationInfo;

import java.util.List;

public class EmployeeListResponse {

    private List<EmployeeSummaryDto> employees;
    private PaginationInfo pagination;

    public EmployeeListResponse(List<EmployeeSummaryDto> employees, PaginationInfo pagination) {
        this.employees = employees;
        this.pagination = pagination;
    }

    public List<EmployeeSummaryDto> getEmployees() { return employees; }
    public void setEmployees(List<EmployeeSummaryDto> employees) { this.employees = employees; }

    public PaginationInfo getPagination() { return pagination; }
    public void setPagination(PaginationInfo pagination) { this.pagination = pagination; }
}

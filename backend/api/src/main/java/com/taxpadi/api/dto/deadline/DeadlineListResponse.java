package com.taxpadi.api.dto.deadline;

import com.taxpadi.api.dto.common.PaginationInfo;

import java.util.List;

public class DeadlineListResponse {

    private List<TaxDeadlineDto> deadlines;
    private PaginationInfo pagination;

    public DeadlineListResponse() {}

    public DeadlineListResponse(List<TaxDeadlineDto> deadlines, PaginationInfo pagination) {
        this.deadlines = deadlines;
        this.pagination = pagination;
    }

    public List<TaxDeadlineDto> getDeadlines() { return deadlines; }
    public void setDeadlines(List<TaxDeadlineDto> deadlines) { this.deadlines = deadlines; }
    public PaginationInfo getPagination() { return pagination; }
    public void setPagination(PaginationInfo pagination) { this.pagination = pagination; }
}

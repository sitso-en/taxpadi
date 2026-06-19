package com.taxpadi.api.dto.deadline;

import com.taxpadi.api.dto.common.PaginationInfo;

import java.util.List;

public class DeadlineListResponse {

    private List<TaxDeadlineDto> deadlines;
    private PaginationInfo pagination;

    public DeadlineListResponse(List<TaxDeadlineDto> deadlines, PaginationInfo pagination) {
        this.deadlines = deadlines;
        this.pagination = pagination;
    }

    public List<TaxDeadlineDto> getDeadlines() { return deadlines; }
    public PaginationInfo getPagination() { return pagination; }
}

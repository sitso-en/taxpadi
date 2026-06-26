package com.taxpadi.api.dto.penalty;

import com.taxpadi.api.dto.common.PaginationInfo;

import java.util.List;

public class PenaltyListResponse {

    private List<PenaltyDto> penalties;
    private PenaltySummary summary;
    private PaginationInfo pagination;

    public PenaltyListResponse(List<PenaltyDto> penalties, PenaltySummary summary, PaginationInfo pagination) {
        this.penalties = penalties;
        this.summary = summary;
        this.pagination = pagination;
    }

    public List<PenaltyDto> getPenalties() { return penalties; }
    public PenaltySummary getSummary() { return summary; }
    public PaginationInfo getPagination() { return pagination; }
}

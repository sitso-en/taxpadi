package com.taxpadi.api.dto.tax;

import com.taxpadi.api.dto.common.PaginationInfo;

import java.util.List;

public class TaxHistoryResponse {

    private List<TaxHistoryItemDto> history;
    private PaginationInfo pagination;

    public TaxHistoryResponse(List<TaxHistoryItemDto> history, PaginationInfo pagination) {
        this.history = history;
        this.pagination = pagination;
    }

    public List<TaxHistoryItemDto> getHistory() { return history; }
    public void setHistory(List<TaxHistoryItemDto> history) { this.history = history; }

    public PaginationInfo getPagination() { return pagination; }
    public void setPagination(PaginationInfo pagination) { this.pagination = pagination; }
}

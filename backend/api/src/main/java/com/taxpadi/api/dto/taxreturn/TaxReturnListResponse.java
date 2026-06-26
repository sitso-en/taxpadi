package com.taxpadi.api.dto.taxreturn;

import com.taxpadi.api.dto.common.PaginationInfo;

import java.util.List;

public class TaxReturnListResponse {

    private List<TaxReturnSummaryDto> returns;
    private PaginationInfo pagination;

    public TaxReturnListResponse(List<TaxReturnSummaryDto> returns, PaginationInfo pagination) {
        this.returns = returns;
        this.pagination = pagination;
    }

    public List<TaxReturnSummaryDto> getReturns() { return returns; }
    public void setReturns(List<TaxReturnSummaryDto> returns) { this.returns = returns; }

    public PaginationInfo getPagination() { return pagination; }
    public void setPagination(PaginationInfo pagination) { this.pagination = pagination; }
}

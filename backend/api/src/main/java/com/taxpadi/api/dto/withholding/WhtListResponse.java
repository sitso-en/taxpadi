package com.taxpadi.api.dto.withholding;

import com.taxpadi.api.dto.common.PaginationInfo;

import java.util.List;

public class WhtListResponse {

    private List<WhtTransactionDto> transactions;
    private WhtSummary summary;
    private PaginationInfo pagination;

    public List<WhtTransactionDto> getTransactions() { return transactions; }
    public void setTransactions(List<WhtTransactionDto> transactions) { this.transactions = transactions; }

    public WhtSummary getSummary() { return summary; }
    public void setSummary(WhtSummary summary) { this.summary = summary; }

    public PaginationInfo getPagination() { return pagination; }
    public void setPagination(PaginationInfo pagination) { this.pagination = pagination; }
}

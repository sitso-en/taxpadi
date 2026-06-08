package com.taxpadi.api.dto.transaction;

import java.util.List;

public class TransactionListResponse {

    private List<TransactionSummaryResponse> transactions;
    private PaginationInfo pagination;

    public List<TransactionSummaryResponse> getTransactions() { return transactions; }
    public void setTransactions(List<TransactionSummaryResponse> transactions) { this.transactions = transactions; }

    public PaginationInfo getPagination() { return pagination; }
    public void setPagination(PaginationInfo pagination) { this.pagination = pagination; }
}

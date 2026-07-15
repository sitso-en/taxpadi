package com.taxpadi.api.dto.vault;

import com.taxpadi.api.dto.common.PaginationInfo;

import java.util.List;

public class VaultTransactionsResponse {

    private List<VaultTransactionDto> transactions;
    private VaultTxnSummary summary;
    private PaginationInfo pagination;

    public VaultTransactionsResponse(List<VaultTransactionDto> transactions, VaultTxnSummary summary, PaginationInfo pagination) {
        this.transactions = transactions;
        this.summary = summary;
        this.pagination = pagination;
    }

    public List<VaultTransactionDto> getTransactions() { return transactions; }
    public VaultTxnSummary getSummary() { return summary; }
    public PaginationInfo getPagination() { return pagination; }
}

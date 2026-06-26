package com.taxpadi.api.dto.payment;

import com.taxpadi.api.dto.common.PaginationInfo;

import java.util.List;

public class PaymentListResponse {
    private List<PaymentListItem> payments;
    private PaymentSummary summary;
    private PaginationInfo pagination;

    public List<PaymentListItem> getPayments() { return payments; }
    public void setPayments(List<PaymentListItem> v) { this.payments = v; }

    public PaymentSummary getSummary() { return summary; }
    public void setSummary(PaymentSummary v) { this.summary = v; }

    public PaginationInfo getPagination() { return pagination; }
    public void setPagination(PaginationInfo v) { this.pagination = v; }
}

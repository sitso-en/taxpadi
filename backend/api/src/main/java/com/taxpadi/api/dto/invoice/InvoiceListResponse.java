package com.taxpadi.api.dto.invoice;

import com.taxpadi.api.dto.common.PaginationInfo;

import java.util.List;

public class InvoiceListResponse {

    private List<InvoiceSummaryDto> invoices;
    private PaginationInfo pagination;

    public InvoiceListResponse(List<InvoiceSummaryDto> invoices, PaginationInfo pagination) {
        this.invoices = invoices;
        this.pagination = pagination;
    }

    public List<InvoiceSummaryDto> getInvoices() { return invoices; }
    public void setInvoices(List<InvoiceSummaryDto> invoices) { this.invoices = invoices; }

    public PaginationInfo getPagination() { return pagination; }
    public void setPagination(PaginationInfo pagination) { this.pagination = pagination; }
}

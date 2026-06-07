package com.taxpadi.api.dto.paye;

import com.taxpadi.api.dto.common.PaginationInfo;

import java.util.List;

public class PayeRecordListResponse {

    private List<PayeRecordDto> records;
    private PayeSummaryDto summary;
    private PaginationInfo pagination;

    public PayeRecordListResponse(List<PayeRecordDto> records, PayeSummaryDto summary, PaginationInfo pagination) {
        this.records = records;
        this.summary = summary;
        this.pagination = pagination;
    }

    public List<PayeRecordDto> getRecords() { return records; }
    public void setRecords(List<PayeRecordDto> records) { this.records = records; }

    public PayeSummaryDto getSummary() { return summary; }
    public void setSummary(PayeSummaryDto summary) { this.summary = summary; }

    public PaginationInfo getPagination() { return pagination; }
    public void setPagination(PaginationInfo pagination) { this.pagination = pagination; }
}

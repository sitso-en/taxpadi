package com.taxpadi.api.dto.report;

import java.util.List;

public class ReportTaxHistoryResponse {

    private List<YearHistoryEntry> history;

    public ReportTaxHistoryResponse(List<YearHistoryEntry> history) {
        this.history = history;
    }

    public List<YearHistoryEntry> getHistory() { return history; }
    public void setHistory(List<YearHistoryEntry> history) { this.history = history; }
}

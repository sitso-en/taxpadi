package com.taxpadi.api.dto.deadline;

import java.util.List;

public class UpcomingDeadlinesResponse {

    private List<TaxDeadlineDto> deadlines;
    private int total;

    public UpcomingDeadlinesResponse(List<TaxDeadlineDto> deadlines) {
        this.deadlines = deadlines;
        this.total = deadlines.size();
    }

    public List<TaxDeadlineDto> getDeadlines() { return deadlines; }
    public int getTotal() { return total; }
}

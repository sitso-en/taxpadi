package com.taxpadi.api.dto.taxbot;

import java.util.List;

public class TaxbotHistoryResponse {

    private List<TaxbotConversationItem> conversations;
    private int page;
    private int limit;
    private long total;
    private int totalPages;

    public TaxbotHistoryResponse(List<TaxbotConversationItem> conversations, int page, int limit,
                                  long total, int totalPages) {
        this.conversations = conversations;
        this.page = page;
        this.limit = limit;
        this.total = total;
        this.totalPages = totalPages;
    }

    public List<TaxbotConversationItem> getConversations() { return conversations; }
    public void setConversations(List<TaxbotConversationItem> conversations) { this.conversations = conversations; }

    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }

    public int getLimit() { return limit; }
    public void setLimit(int limit) { this.limit = limit; }

    public long getTotal() { return total; }
    public void setTotal(long total) { this.total = total; }

    public int getTotalPages() { return totalPages; }
    public void setTotalPages(int totalPages) { this.totalPages = totalPages; }
}

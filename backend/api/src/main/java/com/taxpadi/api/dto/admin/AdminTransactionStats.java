package com.taxpadi.api.dto.admin;

public class AdminTransactionStats {

    private long totalLogged;
    private long loggedThisMonth;

    public AdminTransactionStats(long totalLogged, long loggedThisMonth) {
        this.totalLogged = totalLogged;
        this.loggedThisMonth = loggedThisMonth;
    }

    public long getTotalLogged() { return totalLogged; }
    public long getLoggedThisMonth() { return loggedThisMonth; }
}

package com.taxpadi.api.dto.admin;

public class AdminUserStats {

    private long total;
    private long active;
    private long verified;
    private long freeTier;
    private long paidTier;
    private long newThisMonth;

    public AdminUserStats(long total, long active, long verified, long freeTier, long paidTier, long newThisMonth) {
        this.total = total;
        this.active = active;
        this.verified = verified;
        this.freeTier = freeTier;
        this.paidTier = paidTier;
        this.newThisMonth = newThisMonth;
    }

    public long getTotal() { return total; }
    public long getActive() { return active; }
    public long getVerified() { return verified; }
    public long getFreeTier() { return freeTier; }
    public long getPaidTier() { return paidTier; }
    public long getNewThisMonth() { return newThisMonth; }
}

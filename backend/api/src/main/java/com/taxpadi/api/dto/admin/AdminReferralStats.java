package com.taxpadi.api.dto.admin;

public class AdminReferralStats {

    private long totalOffersGenerated;
    private long totalClicked;
    private long totalConverted;

    public AdminReferralStats(long totalOffersGenerated, long totalClicked, long totalConverted) {
        this.totalOffersGenerated = totalOffersGenerated;
        this.totalClicked = totalClicked;
        this.totalConverted = totalConverted;
    }

    public long getTotalOffersGenerated() { return totalOffersGenerated; }
    public long getTotalClicked() { return totalClicked; }
    public long getTotalConverted() { return totalConverted; }
}

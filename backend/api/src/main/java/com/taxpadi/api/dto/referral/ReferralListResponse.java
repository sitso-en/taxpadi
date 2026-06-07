package com.taxpadi.api.dto.referral;

import java.util.List;

public class ReferralListResponse {

    private List<ReferralOfferItem> offers;
    private long total;

    public ReferralListResponse(List<ReferralOfferItem> offers, long total) {
        this.offers = offers;
        this.total = total;
    }

    public List<ReferralOfferItem> getOffers() { return offers; }
    public void setOffers(List<ReferralOfferItem> offers) { this.offers = offers; }

    public long getTotal() { return total; }
    public void setTotal(long total) { this.total = total; }
}

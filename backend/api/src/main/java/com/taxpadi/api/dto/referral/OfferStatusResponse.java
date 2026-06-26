package com.taxpadi.api.dto.referral;

import com.taxpadi.api.model.ReferralStatus;

import java.util.UUID;

public class OfferStatusResponse {

    private UUID offerId;
    private ReferralStatus status;

    public OfferStatusResponse(UUID offerId, ReferralStatus status) {
        this.offerId = offerId;
        this.status = status;
    }

    public UUID getOfferId() { return offerId; }
    public void setOfferId(UUID offerId) { this.offerId = offerId; }

    public ReferralStatus getStatus() { return status; }
    public void setStatus(ReferralStatus status) { this.status = status; }
}

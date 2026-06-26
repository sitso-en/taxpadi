package com.taxpadi.api.dto.admin;

import java.util.UUID;

public class DeletePartnerResponse {

    private UUID partnerId;
    private boolean isActive;
    private int offersExpired;

    public DeletePartnerResponse(UUID partnerId, boolean isActive, int offersExpired) {
        this.partnerId = partnerId;
        this.isActive = isActive;
        this.offersExpired = offersExpired;
    }

    public UUID getPartnerId() { return partnerId; }
    public boolean isActive() { return isActive; }
    public int getOffersExpired() { return offersExpired; }
}

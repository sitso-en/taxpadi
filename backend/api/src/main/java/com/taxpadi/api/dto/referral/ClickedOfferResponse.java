package com.taxpadi.api.dto.referral;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.taxpadi.api.model.ReferralStatus;

import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ClickedOfferResponse {

    private UUID offerId;
    private String partnerName;
    private String productName;
    private String deepLink;
    private ReferralStatus status;

    public UUID getOfferId() { return offerId; }
    public void setOfferId(UUID offerId) { this.offerId = offerId; }

    public String getPartnerName() { return partnerName; }
    public void setPartnerName(String partnerName) { this.partnerName = partnerName; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getDeepLink() { return deepLink; }
    public void setDeepLink(String deepLink) { this.deepLink = deepLink; }

    public ReferralStatus getStatus() { return status; }
    public void setStatus(ReferralStatus status) { this.status = status; }
}

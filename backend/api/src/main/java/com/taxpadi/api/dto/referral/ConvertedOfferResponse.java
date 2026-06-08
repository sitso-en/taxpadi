package com.taxpadi.api.dto.referral;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.taxpadi.api.model.ReferralStatus;

import java.time.LocalDateTime;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ConvertedOfferResponse {

    private UUID offerId;
    private ReferralStatus status;
    private String partnerReference;
    private LocalDateTime convertedAt;

    public UUID getOfferId() { return offerId; }
    public void setOfferId(UUID offerId) { this.offerId = offerId; }

    public ReferralStatus getStatus() { return status; }
    public void setStatus(ReferralStatus status) { this.status = status; }

    public String getPartnerReference() { return partnerReference; }
    public void setPartnerReference(String partnerReference) { this.partnerReference = partnerReference; }

    public LocalDateTime getConvertedAt() { return convertedAt; }
    public void setConvertedAt(LocalDateTime convertedAt) { this.convertedAt = convertedAt; }
}

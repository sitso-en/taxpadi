package com.taxpadi.api.dto.referral;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.taxpadi.api.model.OfferType;
import com.taxpadi.api.model.ReferralStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ReferralOfferItem {

    private UUID offerId;
    private OfferType offerType;
    private String partnerName;
    private String productName;
    private BigDecimal maxAmount;
    private BigDecimal interestRate;
    private String description;
    private ReferralStatus status;
    private LocalDateTime expiresAt;

    public UUID getOfferId() { return offerId; }
    public void setOfferId(UUID offerId) { this.offerId = offerId; }

    public OfferType getOfferType() { return offerType; }
    public void setOfferType(OfferType offerType) { this.offerType = offerType; }

    public String getPartnerName() { return partnerName; }
    public void setPartnerName(String partnerName) { this.partnerName = partnerName; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public BigDecimal getMaxAmount() { return maxAmount; }
    public void setMaxAmount(BigDecimal maxAmount) { this.maxAmount = maxAmount; }

    public BigDecimal getInterestRate() { return interestRate; }
    public void setInterestRate(BigDecimal interestRate) { this.interestRate = interestRate; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public ReferralStatus getStatus() { return status; }
    public void setStatus(ReferralStatus status) { this.status = status; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
}

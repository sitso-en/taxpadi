package com.taxpadi.api.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreatePartnerRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String offerType;

    @NotNull
    private EligibilityThreshold eligibilityThreshold;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getOfferType() { return offerType; }
    public void setOfferType(String offerType) { this.offerType = offerType; }

    public EligibilityThreshold getEligibilityThreshold() { return eligibilityThreshold; }
    public void setEligibilityThreshold(EligibilityThreshold eligibilityThreshold) { this.eligibilityThreshold = eligibilityThreshold; }
}

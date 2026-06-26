package com.taxpadi.api.dto.admin;

public class UpdatePartnerRequest {

    private String name;
    private EligibilityThreshold eligibilityThreshold;
    private Boolean isActive;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public EligibilityThreshold getEligibilityThreshold() { return eligibilityThreshold; }
    public void setEligibilityThreshold(EligibilityThreshold eligibilityThreshold) { this.eligibilityThreshold = eligibilityThreshold; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}

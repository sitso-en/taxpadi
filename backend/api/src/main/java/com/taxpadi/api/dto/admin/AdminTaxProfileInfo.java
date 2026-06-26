package com.taxpadi.api.dto.admin;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class  AdminTaxProfileInfo {
    private Boolean vatRegistered;

    private Boolean payeRegistered;

    private Boolean onboardingComplete;

    public AdminTaxProfileInfo(Boolean vatRegistered, Boolean payeRegistered, Boolean onboardingComplete) {
        this.vatRegistered = vatRegistered;
        this.payeRegistered = payeRegistered;
        this.onboardingComplete = onboardingComplete;
    }

    public Boolean getVatRegistered() {
        return vatRegistered;
    }

    public void setVatRegistered(Boolean vatRegistered) {
        this.vatRegistered = vatRegistered;
    }

    public Boolean getPayeRegistered() {
        return payeRegistered;
    }

    public void setPayeRegistered(Boolean payeRegistered) {
        this.payeRegistered = payeRegistered;
    }

    public Boolean getOnboardingComplete() {
        return onboardingComplete;
    }

    public void setOnboardingComplete(Boolean onboardingComplete) {
        this.onboardingComplete = onboardingComplete;
    }

    
}

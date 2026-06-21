package com.taxpadi.api.dto.taxprofile;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDate;

public class CompleteOnboardingResponse {
    @JsonProperty("onboarding_complete")
    private boolean onboardingComplete;

    @JsonProperty("tax_year_start")
    private LocalDate taxYearStart;

    @JsonProperty("deadlines_generated")
    private int deadlinesGenerated;

    @JsonProperty("tin_saved")
    private boolean tinSaved;

    public boolean isOnboardingComplete() { return onboardingComplete; }
    public void setOnboardingComplete(boolean v) { this.onboardingComplete = v; }

    public LocalDate getTaxYearStart() { return taxYearStart; }
    public void setTaxYearStart(LocalDate v) { this.taxYearStart = v; }

    public int getDeadlinesGenerated() { return deadlinesGenerated; }
    public void setDeadlinesGenerated(int v) { this.deadlinesGenerated = v; }

    public boolean isTinSaved() { return tinSaved; }
    public void setTinSaved(boolean v) { this.tinSaved = v; }
}

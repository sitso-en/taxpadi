package com.taxpadi.api.dto.referral;

public class EligibilityResponse {

    private boolean eligible;
    private int newOffersGenerated;
    private EligibilityBasis eligibilityBasis;

    public boolean isEligible() { return eligible; }
    public void setEligible(boolean eligible) { this.eligible = eligible; }

    public int getNewOffersGenerated() { return newOffersGenerated; }
    public void setNewOffersGenerated(int newOffersGenerated) { this.newOffersGenerated = newOffersGenerated; }

    public EligibilityBasis getEligibilityBasis() { return eligibilityBasis; }
    public void setEligibilityBasis(EligibilityBasis eligibilityBasis) { this.eligibilityBasis = eligibilityBasis; }
}

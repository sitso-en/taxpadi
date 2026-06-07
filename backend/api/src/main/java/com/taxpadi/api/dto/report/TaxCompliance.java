package com.taxpadi.api.dto.report;

public class TaxCompliance {

    private boolean allReturnsFiled;
    private boolean allPaymentsMade;
    private String complianceScore;

    public TaxCompliance(boolean allReturnsFiled, boolean allPaymentsMade, String complianceScore) {
        this.allReturnsFiled = allReturnsFiled;
        this.allPaymentsMade = allPaymentsMade;
        this.complianceScore = complianceScore;
    }

    public boolean isAllReturnsFiled() { return allReturnsFiled; }
    public void setAllReturnsFiled(boolean allReturnsFiled) { this.allReturnsFiled = allReturnsFiled; }

    public boolean isAllPaymentsMade() { return allPaymentsMade; }
    public void setAllPaymentsMade(boolean allPaymentsMade) { this.allPaymentsMade = allPaymentsMade; }

    public String getComplianceScore() { return complianceScore; }
    public void setComplianceScore(String complianceScore) { this.complianceScore = complianceScore; }
}

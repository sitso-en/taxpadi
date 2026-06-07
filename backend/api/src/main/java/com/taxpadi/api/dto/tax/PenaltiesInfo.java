package com.taxpadi.api.dto.tax;

public class PenaltiesInfo {

    private String latePaymentRate;
    private String payeLateRemittance;

    public PenaltiesInfo(String latePaymentRate, String payeLateRemittance) {
        this.latePaymentRate = latePaymentRate;
        this.payeLateRemittance = payeLateRemittance;
    }

    public String getLatePaymentRate() { return latePaymentRate; }
    public void setLatePaymentRate(String latePaymentRate) { this.latePaymentRate = latePaymentRate; }

    public String getPayeLateRemittance() { return payeLateRemittance; }
    public void setPayeLateRemittance(String payeLateRemittance) { this.payeLateRemittance = payeLateRemittance; }
}

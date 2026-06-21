package com.taxpadi.api.dto.subscription;

import com.fasterxml.jackson.annotation.JsonProperty;

public class SubscribeRequest {
    private String plan;

    @JsonProperty("payment_method")
    private String paymentMethod;

    @JsonProperty("momo_number")
    private String momoNumber;

    @JsonProperty("momo_provider")
    private String momoProvider;

    public String getPlan() { return plan; }
    public void setPlan(String v) { this.plan = v; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String v) { this.paymentMethod = v; }

    public String getMomoNumber() { return momoNumber; }
    public void setMomoNumber(String v) { this.momoNumber = v; }

    public String getMomoProvider() { return momoProvider; }
    public void setMomoProvider(String v) { this.momoProvider = v; }
}

package com.taxpadi.api.dto.payment;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ConfirmPaymentRequest {
    @JsonProperty("payment_reference")
    private String paymentReference;

    private String status;

    public String getPaymentReference() { return paymentReference; }
    public void setPaymentReference(String v) { this.paymentReference = v; }

    public String getStatus() { return status; }
    public void setStatus(String v) { this.status = v; }
}

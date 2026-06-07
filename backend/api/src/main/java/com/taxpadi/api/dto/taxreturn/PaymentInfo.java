package com.taxpadi.api.dto.taxreturn;

public class PaymentInfo {

    private boolean paid;
    private String paymentId;
    private String amountPaid;
    private String paidAt;

    public PaymentInfo(boolean paid, String paymentId, String amountPaid, String paidAt) {
        this.paid = paid;
        this.paymentId = paymentId;
        this.amountPaid = amountPaid;
        this.paidAt = paidAt;
    }

    public boolean isPaid() { return paid; }
    public void setPaid(boolean paid) { this.paid = paid; }

    public String getPaymentId() { return paymentId; }
    public void setPaymentId(String paymentId) { this.paymentId = paymentId; }

    public String getAmountPaid() { return amountPaid; }
    public void setAmountPaid(String amountPaid) { this.amountPaid = amountPaid; }

    public String getPaidAt() { return paidAt; }
    public void setPaidAt(String paidAt) { this.paidAt = paidAt; }
}

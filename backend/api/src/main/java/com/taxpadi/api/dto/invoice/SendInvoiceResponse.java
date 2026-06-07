package com.taxpadi.api.dto.invoice;

import java.time.LocalDateTime;
import java.util.UUID;

public class SendInvoiceResponse {

    private UUID invoiceId;
    private String invoiceRef;
    private String sentVia;
    private SentTo sentTo;
    private LocalDateTime sentAt;
    private DeliveryInfo delivery;

    public UUID getInvoiceId() { return invoiceId; }
    public void setInvoiceId(UUID invoiceId) { this.invoiceId = invoiceId; }

    public String getInvoiceRef() { return invoiceRef; }
    public void setInvoiceRef(String invoiceRef) { this.invoiceRef = invoiceRef; }

    public String getSentVia() { return sentVia; }
    public void setSentVia(String sentVia) { this.sentVia = sentVia; }

    public SentTo getSentTo() { return sentTo; }
    public void setSentTo(SentTo sentTo) { this.sentTo = sentTo; }

    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }

    public DeliveryInfo getDelivery() { return delivery; }
    public void setDelivery(DeliveryInfo delivery) { this.delivery = delivery; }
}

package com.taxpadi.api.dto.invoice;

import java.time.LocalDateTime;
import java.util.UUID;

public class CancelInvoiceResponse {

    private UUID invoiceId;
    private String invoiceRef;
    private String status;
    private LocalDateTime cancelledAt;

    public UUID getInvoiceId() { return invoiceId; }
    public void setInvoiceId(UUID invoiceId) { this.invoiceId = invoiceId; }

    public String getInvoiceRef() { return invoiceRef; }
    public void setInvoiceRef(String invoiceRef) { this.invoiceRef = invoiceRef; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(LocalDateTime cancelledAt) { this.cancelledAt = cancelledAt; }
}

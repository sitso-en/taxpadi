package com.taxpadi.api.dto.invoice;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class CreateInvoiceResponse {

    private UUID invoiceId;
    private String invoiceRef;
    private String clientName;
    private BigDecimal subtotal;
    private BigDecimal vatAmount;
    private BigDecimal totalAmount;
    private String status;
    private String pdfUrl;
    private LocalDateTime createdAt;

    public UUID getInvoiceId() { return invoiceId; }
    public void setInvoiceId(UUID invoiceId) { this.invoiceId = invoiceId; }

    public String getInvoiceRef() { return invoiceRef; }
    public void setInvoiceRef(String invoiceRef) { this.invoiceRef = invoiceRef; }

    public String getClientName() { return clientName; }
    public void setClientName(String clientName) { this.clientName = clientName; }

    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }

    public BigDecimal getVatAmount() { return vatAmount; }
    public void setVatAmount(BigDecimal vatAmount) { this.vatAmount = vatAmount; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPdfUrl() { return pdfUrl; }
    public void setPdfUrl(String pdfUrl) { this.pdfUrl = pdfUrl; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

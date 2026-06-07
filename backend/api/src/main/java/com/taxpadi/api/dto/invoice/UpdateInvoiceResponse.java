package com.taxpadi.api.dto.invoice;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class UpdateInvoiceResponse {

    private UUID invoiceId;
    private String invoiceRef;
    private BigDecimal subtotal;
    private BigDecimal vatAmount;
    private BigDecimal totalAmount;
    private String pdfUrl;
    private LocalDateTime updatedAt;

    public UUID getInvoiceId() { return invoiceId; }
    public void setInvoiceId(UUID invoiceId) { this.invoiceId = invoiceId; }

    public String getInvoiceRef() { return invoiceRef; }
    public void setInvoiceRef(String invoiceRef) { this.invoiceRef = invoiceRef; }

    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }

    public BigDecimal getVatAmount() { return vatAmount; }
    public void setVatAmount(BigDecimal vatAmount) { this.vatAmount = vatAmount; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public String getPdfUrl() { return pdfUrl; }
    public void setPdfUrl(String pdfUrl) { this.pdfUrl = pdfUrl; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

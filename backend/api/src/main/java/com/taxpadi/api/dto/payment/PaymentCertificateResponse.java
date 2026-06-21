package com.taxpadi.api.dto.payment;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.taxpadi.api.dto.certificate.TaxpayerInfo;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class PaymentCertificateResponse {
    @JsonProperty("certificate_id")
    private UUID certificateId;

    @JsonProperty("document_ref")
    private String documentRef;

    private TaxpayerInfo taxpayer;

    @JsonProperty("tax_type")
    private String taxType;

    @JsonProperty("period_start")
    private LocalDate periodStart;

    @JsonProperty("period_end")
    private LocalDate periodEnd;

    @JsonProperty("amount_paid")
    private BigDecimal amountPaid;

    @JsonProperty("payment_reference")
    private String paymentReference;

    @JsonProperty("issued_at")
    private LocalDateTime issuedAt;

    public UUID getCertificateId() { return certificateId; }
    public void setCertificateId(UUID v) { this.certificateId = v; }

    public String getDocumentRef() { return documentRef; }
    public void setDocumentRef(String v) { this.documentRef = v; }

    public TaxpayerInfo getTaxpayer() { return taxpayer; }
    public void setTaxpayer(TaxpayerInfo v) { this.taxpayer = v; }

    public String getTaxType() { return taxType; }
    public void setTaxType(String v) { this.taxType = v; }

    public LocalDate getPeriodStart() { return periodStart; }
    public void setPeriodStart(LocalDate v) { this.periodStart = v; }

    public LocalDate getPeriodEnd() { return periodEnd; }
    public void setPeriodEnd(LocalDate v) { this.periodEnd = v; }

    public BigDecimal getAmountPaid() { return amountPaid; }
    public void setAmountPaid(BigDecimal v) { this.amountPaid = v; }

    public String getPaymentReference() { return paymentReference; }
    public void setPaymentReference(String v) { this.paymentReference = v; }

    public LocalDateTime getIssuedAt() { return issuedAt; }
    public void setIssuedAt(LocalDateTime v) { this.issuedAt = v; }
}

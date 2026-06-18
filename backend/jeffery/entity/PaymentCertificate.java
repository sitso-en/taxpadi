package com.taxpadi.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "payment_certificates")
public class PaymentCertificate {

    @Id
    @Column(nullable = false, unique = true)
    private String certificateId = UUID.randomUUID().toString();

    @Column(name = "payment_id", nullable = false, unique = true)
    private String paymentId;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "document_ref", nullable = false, unique = true)
    private String documentRef;

    @Column(name = "tax_type")
    private String taxType;

    @Column(name = "period_start")
    private LocalDate periodStart;

    @Column(name = "period_end")
    private LocalDate periodEnd;

    @Column(name = "amount_paid", precision = 15, scale = 2)
    private BigDecimal amountPaid;

    @Column(name = "payment_reference")
    private String paymentReference;

    @Column(name = "taxpayer_full_name")
    private String taxpayerFullName;

    @Column(name = "taxpayer_tin")
    private String taxpayerTin;

    @Column(name = "taxpayer_phone")
    private String taxpayerPhone;

    @Column(name = "issued_at", updatable = false)
    private LocalDateTime issuedAt = LocalDateTime.now();

    public PaymentCertificate() {}

    public String getCertificateId() { return certificateId; }
    public String getPaymentId() { return paymentId; }
    public String getUserId() { return userId; }
    public String getDocumentRef() { return documentRef; }
    public String getTaxType() { return taxType; }
    public LocalDate getPeriodStart() { return periodStart; }
    public LocalDate getPeriodEnd() { return periodEnd; }
    public BigDecimal getAmountPaid() { return amountPaid; }
    public String getPaymentReference() { return paymentReference; }
    public String getTaxpayerFullName() { return taxpayerFullName; }
    public String getTaxpayerTin() { return taxpayerTin; }
    public String getTaxpayerPhone() { return taxpayerPhone; }
    public LocalDateTime getIssuedAt() { return issuedAt; }

    public void setPaymentId(String v) { this.paymentId = v; }
    public void setUserId(String v) { this.userId = v; }
    public void setDocumentRef(String v) { this.documentRef = v; }
    public void setTaxType(String v) { this.taxType = v; }
    public void setPeriodStart(LocalDate v) { this.periodStart = v; }
    public void setPeriodEnd(LocalDate v) { this.periodEnd = v; }
    public void setAmountPaid(BigDecimal v) { this.amountPaid = v; }
    public void setPaymentReference(String v) { this.paymentReference = v; }
    public void setTaxpayerFullName(String v) { this.taxpayerFullName = v; }
    public void setTaxpayerTin(String v) { this.taxpayerTin = v; }
    public void setTaxpayerPhone(String v) { this.taxpayerPhone = v; }
}
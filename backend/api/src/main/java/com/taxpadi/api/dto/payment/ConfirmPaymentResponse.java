package com.taxpadi.api.dto.payment;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ConfirmPaymentResponse {
    @JsonProperty("payment_id")
    private UUID paymentId;

    private String status;

    @JsonProperty("payment_reference")
    private String paymentReference;

    @JsonProperty("paid_at")
    private LocalDateTime paidAt;

    @JsonProperty("certificate_generated")
    private boolean certificateGenerated;

    private LinkedCertificateInfo certificate;

    public UUID getPaymentId() { return paymentId; }
    public void setPaymentId(UUID v) { this.paymentId = v; }

    public String getStatus() { return status; }
    public void setStatus(String v) { this.status = v; }

    public String getPaymentReference() { return paymentReference; }
    public void setPaymentReference(String v) { this.paymentReference = v; }

    public LocalDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(LocalDateTime v) { this.paidAt = v; }

    public boolean isCertificateGenerated() { return certificateGenerated; }
    public void setCertificateGenerated(boolean v) { this.certificateGenerated = v; }

    public LinkedCertificateInfo getCertificate() { return certificate; }
    public void setCertificate(LinkedCertificateInfo v) { this.certificate = v; }
}

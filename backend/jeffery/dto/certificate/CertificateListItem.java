package com.taxpadi.api.dto.certificate;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class CertificateListItem {

    private UUID certificateId;
    private String documentRef;
    private String taxType;
    private LocalDateTime issuedAt;

    public UUID getCertificateId() { return certificateId; }
    public void setCertificateId(UUID v) { this.certificateId = v; }
    public String getDocumentRef() { return documentRef; }
    public void setDocumentRef(String v) { this.documentRef = v; }
    public String getTaxType() { return taxType; }
    public void setTaxType(String v) { this.taxType = v; }
    public LocalDateTime getIssuedAt() { return issuedAt; }
    public void setIssuedAt(LocalDateTime v) { this.issuedAt = v; }
}

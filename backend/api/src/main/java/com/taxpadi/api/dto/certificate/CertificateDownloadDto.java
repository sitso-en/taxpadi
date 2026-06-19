package com.taxpadi.api.dto.certificate;

import java.time.LocalDateTime;
import java.util.UUID;

public class CertificateDownloadDto {

    private UUID certificateId;
    private String documentRef;
    private String pdfUrl;
    private LocalDateTime expiresAt;

    public UUID getCertificateId() { return certificateId; }
    public void setCertificateId(UUID v) { this.certificateId = v; }
    public String getDocumentRef() { return documentRef; }
    public void setDocumentRef(String v) { this.documentRef = v; }
    public String getPdfUrl() { return pdfUrl; }
    public void setPdfUrl(String v) { this.pdfUrl = v; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime v) { this.expiresAt = v; }
}

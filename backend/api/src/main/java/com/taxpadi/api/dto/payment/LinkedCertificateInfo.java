package com.taxpadi.api.dto.payment;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class LinkedCertificateInfo {
    @JsonProperty("certificate_id")
    private UUID certificateId;

    @JsonProperty("document_ref")
    private String documentRef;

    public UUID getCertificateId() { return certificateId; }
    public void setCertificateId(UUID v) { this.certificateId = v; }

    public String getDocumentRef() { return documentRef; }
    public void setDocumentRef(String v) { this.documentRef = v; }
}

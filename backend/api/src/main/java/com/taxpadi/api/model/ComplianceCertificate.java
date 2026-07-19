package com.taxpadi.api.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "compliance_certificates")
public class ComplianceCertificate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "certificate_id")
    private UUID certificateId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, unique = true, length = 50)
    private String certificateNumber;

    @Column(nullable = false, length = 50)
    private String certificateType;

    @Column(nullable = false, length = 20)
    private String status;

    private LocalDate issueDate;

    private LocalDate expiryDate;

    @Column(length = 150)
    private String issuedBy;

    @Column(name = "tin_number", length = 20)
    private String tinNumber;

    @Column(name = "business_name", length = 200)
    private String businessName;

    @Column(name = "download_url", length = 500)
    private String downloadUrl;

    @Column(length = 500)
    private String remarks;

    @Column(nullable = false, updatable = false)
    private LocalDateTime requestedAt;

    private LocalDateTime issuedAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        requestedAt = LocalDateTime.now();
    }

    public UUID getCertificateId() { return certificateId; }
    public User getUser() { return user; }
    public void setUser(User v) { this.user = v; }
    public String getCertificateNumber() { return certificateNumber; }
    public void setCertificateNumber(String v) { this.certificateNumber = v; }
    public String getCertificateType() { return certificateType; }
    public void setCertificateType(String v) { this.certificateType = v; }
    public String getStatus() { return status; }
    public void setStatus(String v) { this.status = v; }
    public LocalDate getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDate v) { this.issueDate = v; }
    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate v) { this.expiryDate = v; }
    public String getIssuedBy() { return issuedBy; }
    public void setIssuedBy(String v) { this.issuedBy = v; }
    public String getTinNumber() { return tinNumber; }
    public void setTinNumber(String v) { this.tinNumber = v; }
    public String getBusinessName() { return businessName; }
    public void setBusinessName(String v) { this.businessName = v; }
    public String getDownloadUrl() { return downloadUrl; }
    public void setDownloadUrl(String v) { this.downloadUrl = v; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String v) { this.remarks = v; }
    public LocalDateTime getRequestedAt() { return requestedAt; }
    public LocalDateTime getIssuedAt() { return issuedAt; }
    public void setIssuedAt(LocalDateTime v) { this.issuedAt = v; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}

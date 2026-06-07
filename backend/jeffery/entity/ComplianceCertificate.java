package com.taxpadi.entity;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
@Entity @Table(name="compliance_certificates")
public class ComplianceCertificate {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false) private Long userId;
    @Column(nullable=false,unique=true) private String certificateNumber;
    @Column(nullable=false) private String certificateType;
    @Column(nullable=false) private String status;
    private LocalDate issueDate;
    private LocalDate expiryDate;
    private String issuedBy;
    private String tinNumber;
    private String businessName;
    private String downloadUrl;
    private String remarks;
    @Column(updatable=false) private LocalDateTime requestedAt=LocalDateTime.now();
    private LocalDateTime issuedAt;
    @Column(updatable=false) private LocalDateTime createdAt=LocalDateTime.now();
    public ComplianceCertificate(){}
    public Long getId(){return id;}
    public Long getUserId(){return userId;}
    public String getCertificateNumber(){return certificateNumber;}
    public String getCertificateType(){return certificateType;}
    public String getStatus(){return status;}
    public LocalDate getIssueDate(){return issueDate;}
    public LocalDate getExpiryDate(){return expiryDate;}
    public String getIssuedBy(){return issuedBy;}
    public String getTinNumber(){return tinNumber;}
    public String getBusinessName(){return businessName;}
    public String getDownloadUrl(){return downloadUrl;}
    public String getRemarks(){return remarks;}
    public LocalDateTime getRequestedAt(){return requestedAt;}
    public LocalDateTime getIssuedAt(){return issuedAt;}
    public LocalDateTime getCreatedAt(){return createdAt;}
    public void setUserId(Long v){this.userId=v;}
    public void setCertificateNumber(String v){this.certificateNumber=v;}
    public void setCertificateType(String v){this.certificateType=v;}
    public void setStatus(String v){this.status=v;}
    public void setIssueDate(LocalDate v){this.issueDate=v;}
    public void setExpiryDate(LocalDate v){this.expiryDate=v;}
    public void setIssuedBy(String v){this.issuedBy=v;}
    public void setTinNumber(String v){this.tinNumber=v;}
    public void setBusinessName(String v){this.businessName=v;}
    public void setDownloadUrl(String v){this.downloadUrl=v;}
    public void setRemarks(String v){this.remarks=v;}
    public void setIssuedAt(LocalDateTime v){this.issuedAt=v;}
}

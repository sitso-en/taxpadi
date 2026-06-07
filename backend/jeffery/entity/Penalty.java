package com.taxpadi.entity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
@Entity @Table(name="penalties")
public class Penalty {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false) private Long userId;
    @Column(nullable=false) private String taxType;
    @Column(nullable=false) private String penaltyType;
    @Column(nullable=false,precision=15,scale=2) private BigDecimal originalTaxAmount;
    @Column(nullable=false,precision=15,scale=2) private BigDecimal penaltyAmount;
    @Column(precision=5,scale=4) private BigDecimal penaltyRate;
    @Column(nullable=false) private LocalDate dueDate;
    @Column(nullable=false) private LocalDate filingDate;
    private int daysLate;
    @Column(nullable=false) private String status;
    private String description;
    private String referenceNumber;
    private LocalDateTime paidAt;
    @Column(updatable=false) private LocalDateTime createdAt=LocalDateTime.now();
    private LocalDateTime updatedAt=LocalDateTime.now();
    public Penalty(){}
    public Long getId(){return id;}
    public Long getUserId(){return userId;}
    public String getTaxType(){return taxType;}
    public String getPenaltyType(){return penaltyType;}
    public BigDecimal getOriginalTaxAmount(){return originalTaxAmount;}
    public BigDecimal getPenaltyAmount(){return penaltyAmount;}
    public BigDecimal getPenaltyRate(){return penaltyRate;}
    public LocalDate getDueDate(){return dueDate;}
    public LocalDate getFilingDate(){return filingDate;}
    public int getDaysLate(){return daysLate;}
    public String getStatus(){return status;}
    public String getDescription(){return description;}
    public String getReferenceNumber(){return referenceNumber;}
    public LocalDateTime getPaidAt(){return paidAt;}
    public LocalDateTime getCreatedAt(){return createdAt;}
    public LocalDateTime getUpdatedAt(){return updatedAt;}
    public void setUserId(Long v){this.userId=v;}
    public void setTaxType(String v){this.taxType=v;}
    public void setPenaltyType(String v){this.penaltyType=v;}
    public void setOriginalTaxAmount(BigDecimal v){this.originalTaxAmount=v;}
    public void setPenaltyAmount(BigDecimal v){this.penaltyAmount=v;}
    public void setPenaltyRate(BigDecimal v){this.penaltyRate=v;}
    public void setDueDate(LocalDate v){this.dueDate=v;}
    public void setFilingDate(LocalDate v){this.filingDate=v;}
    public void setDaysLate(int v){this.daysLate=v;}
    public void setStatus(String v){this.status=v;}
    public void setDescription(String v){this.description=v;}
    public void setReferenceNumber(String v){this.referenceNumber=v;}
    public void setPaidAt(LocalDateTime v){this.paidAt=v;}
    public void setUpdatedAt(LocalDateTime v){this.updatedAt=v;}
}

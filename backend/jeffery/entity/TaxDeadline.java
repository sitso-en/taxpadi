package com.taxpadi.entity;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
@Entity @Table(name="tax_deadlines")
public class TaxDeadline {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false) private String title;
    @Column(nullable=false) private String taxType;
    @Column(nullable=false,length=1000) private String description;
    @Column(nullable=false) private LocalDate dueDate;
    @Column(nullable=false) private String frequency;
    @Column(nullable=false) private String status;
    @Column(nullable=false) private String applicableTo;
    private String penaltyDescription;
    private boolean isActive=true;
    @Column(updatable=false) private LocalDateTime createdAt=LocalDateTime.now();
    private LocalDateTime updatedAt=LocalDateTime.now();
    public TaxDeadline(){}
    public Long getId(){return id;}
    public String getTitle(){return title;}
    public String getTaxType(){return taxType;}
    public String getDescription(){return description;}
    public LocalDate getDueDate(){return dueDate;}
    public String getFrequency(){return frequency;}
    public String getStatus(){return status;}
    public String getApplicableTo(){return applicableTo;}
    public String getPenaltyDescription(){return penaltyDescription;}
    public boolean isActive(){return isActive;}
    public LocalDateTime getCreatedAt(){return createdAt;}
    public LocalDateTime getUpdatedAt(){return updatedAt;}
    public void setTitle(String v){this.title=v;}
    public void setTaxType(String v){this.taxType=v;}
    public void setDescription(String v){this.description=v;}
    public void setDueDate(LocalDate v){this.dueDate=v;}
    public void setFrequency(String v){this.frequency=v;}
    public void setStatus(String v){this.status=v;}
    public void setApplicableTo(String v){this.applicableTo=v;}
    public void setPenaltyDescription(String v){this.penaltyDescription=v;}
    public void setActive(boolean v){this.isActive=v;}
    public void setUpdatedAt(LocalDateTime v){this.updatedAt=v;}
}

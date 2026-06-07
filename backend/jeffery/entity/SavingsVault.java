package com.taxpadi.entity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
@Entity @Table(name="savings_vaults")
public class SavingsVault {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false) private Long userId;
    @Column(nullable=false) private String vaultName;
    @Column(nullable=false,precision=15,scale=2) private BigDecimal balance=BigDecimal.ZERO;
    @Column(nullable=false,precision=15,scale=2) private BigDecimal targetAmount=BigDecimal.ZERO;
    @Column(nullable=false,precision=15,scale=2) private BigDecimal autoSaveAmount=BigDecimal.ZERO;
    @Column(nullable=false) private String autoSaveFrequency="MONTHLY";
    private boolean autoSaveEnabled=false;
    @Column(nullable=false) private String status="ACTIVE";
    private String purpose;
    @Column(updatable=false) private LocalDateTime createdAt=LocalDateTime.now();
    private LocalDateTime updatedAt=LocalDateTime.now();
    public SavingsVault(){}
    public Long getId(){return id;}
    public Long getUserId(){return userId;}
    public String getVaultName(){return vaultName;}
    public BigDecimal getBalance(){return balance;}
    public BigDecimal getTargetAmount(){return targetAmount;}
    public BigDecimal getAutoSaveAmount(){return autoSaveAmount;}
    public String getAutoSaveFrequency(){return autoSaveFrequency;}
    public boolean isAutoSaveEnabled(){return autoSaveEnabled;}
    public String getStatus(){return status;}
    public String getPurpose(){return purpose;}
    public LocalDateTime getCreatedAt(){return createdAt;}
    public LocalDateTime getUpdatedAt(){return updatedAt;}
    public void setUserId(Long v){this.userId=v;}
    public void setVaultName(String v){this.vaultName=v;}
    public void setBalance(BigDecimal v){this.balance=v;}
    public void setTargetAmount(BigDecimal v){this.targetAmount=v;}
    public void setAutoSaveAmount(BigDecimal v){this.autoSaveAmount=v;}
    public void setAutoSaveFrequency(String v){this.autoSaveFrequency=v;}
    public void setAutoSaveEnabled(boolean v){this.autoSaveEnabled=v;}
    public void setStatus(String v){this.status=v;}
    public void setPurpose(String v){this.purpose=v;}
    public void setUpdatedAt(LocalDateTime v){this.updatedAt=v;}
}

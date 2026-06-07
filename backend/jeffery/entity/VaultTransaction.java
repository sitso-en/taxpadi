package com.taxpadi.entity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
@Entity @Table(name="vault_transactions")
public class VaultTransaction {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false) private Long vaultId;
    @Column(nullable=false) private Long userId;
    @Column(nullable=false) private String type;
    @Column(nullable=false,precision=15,scale=2) private BigDecimal amount;
    @Column(nullable=false,precision=15,scale=2) private BigDecimal balanceAfter;
    private String description;
    private String reference;
    @Column(updatable=false) private LocalDateTime createdAt=LocalDateTime.now();
    public VaultTransaction(){}
    public Long getId(){return id;}
    public Long getVaultId(){return vaultId;}
    public Long getUserId(){return userId;}
    public String getType(){return type;}
    public BigDecimal getAmount(){return amount;}
    public BigDecimal getBalanceAfter(){return balanceAfter;}
    public String getDescription(){return description;}
    public String getReference(){return reference;}
    public LocalDateTime getCreatedAt(){return createdAt;}
    public void setVaultId(Long v){this.vaultId=v;}
    public void setUserId(Long v){this.userId=v;}
    public void setType(String v){this.type=v;}
    public void setAmount(BigDecimal v){this.amount=v;}
    public void setBalanceAfter(BigDecimal v){this.balanceAfter=v;}
    public void setDescription(String v){this.description=v;}
    public void setReference(String v){this.reference=v;}
}

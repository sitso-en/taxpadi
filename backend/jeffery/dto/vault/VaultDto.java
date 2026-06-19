package com.taxpadi.api.dto.vault;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.math.BigDecimal;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class VaultDto {

    private UUID vaultId;
    private BigDecimal balance;
    private String linkedMomoNumber;
    private String linkedMomoProvider;
    private BigDecimal totalContributed;
    private BigDecimal totalWithdrawn;
    private boolean momoLinked;
    private VaultTarget target;

    public UUID getVaultId() { return vaultId; }
    public void setVaultId(UUID v) { this.vaultId = v; }
    public BigDecimal getBalance() { return balance; }
    public void setBalance(BigDecimal v) { this.balance = v; }
    public String getLinkedMomoNumber() { return linkedMomoNumber; }
    public void setLinkedMomoNumber(String v) { this.linkedMomoNumber = v; }
    public String getLinkedMomoProvider() { return linkedMomoProvider; }
    public void setLinkedMomoProvider(String v) { this.linkedMomoProvider = v; }
    public BigDecimal getTotalContributed() { return totalContributed; }
    public void setTotalContributed(BigDecimal v) { this.totalContributed = v; }
    public BigDecimal getTotalWithdrawn() { return totalWithdrawn; }
    public void setTotalWithdrawn(BigDecimal v) { this.totalWithdrawn = v; }
    public boolean isMomoLinked() { return momoLinked; }
    public void setMomoLinked(boolean v) { this.momoLinked = v; }
    public VaultTarget getTarget() { return target; }
    public void setTarget(VaultTarget v) { this.target = v; }
}

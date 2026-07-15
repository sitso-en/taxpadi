package com.taxpadi.api.dto.vault;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class VaultTransactionDto {

    private UUID vaultTransactionId;
    private String type;
    private BigDecimal amount;
    private String trigger;
    private String momoReference;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime confirmedAt;

    public UUID getVaultTransactionId() { return vaultTransactionId; }
    public void setVaultTransactionId(UUID v) { this.vaultTransactionId = v; }
    public String getType() { return type; }
    public void setType(String v) { this.type = v; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal v) { this.amount = v; }
    public String getTrigger() { return trigger; }
    public void setTrigger(String v) { this.trigger = v; }
    public String getMomoReference() { return momoReference; }
    public void setMomoReference(String v) { this.momoReference = v; }
    public String getStatus() { return status; }
    public void setStatus(String v) { this.status = v; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime v) { this.createdAt = v; }
    public LocalDateTime getConfirmedAt() { return confirmedAt; }
    public void setConfirmedAt(LocalDateTime v) { this.confirmedAt = v; }
}

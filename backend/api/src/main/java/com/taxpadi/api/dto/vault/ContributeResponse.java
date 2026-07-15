package com.taxpadi.api.dto.vault;

import java.math.BigDecimal;
import java.util.UUID;

public class ContributeResponse {

    private UUID vaultTransactionId;
    private BigDecimal amount;
    private String trigger;
    private String status;
    private boolean momoPromptSent;
    private String message;
    private BigDecimal newBalanceOnConfirmation;

    public UUID getVaultTransactionId() { return vaultTransactionId; }
    public void setVaultTransactionId(UUID v) { this.vaultTransactionId = v; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal v) { this.amount = v; }
    public String getTrigger() { return trigger; }
    public void setTrigger(String v) { this.trigger = v; }
    public String getStatus() { return status; }
    public void setStatus(String v) { this.status = v; }
    public boolean isMomoPromptSent() { return momoPromptSent; }
    public void setMomoPromptSent(boolean v) { this.momoPromptSent = v; }
    public String getMessage() { return message; }
    public void setMessage(String v) { this.message = v; }
    public BigDecimal getNewBalanceOnConfirmation() { return newBalanceOnConfirmation; }
    public void setNewBalanceOnConfirmation(BigDecimal v) { this.newBalanceOnConfirmation = v; }
}

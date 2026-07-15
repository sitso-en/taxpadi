package com.taxpadi.api.dto.vault;

import java.time.LocalDateTime;
import java.util.UUID;

public class LinkMomoResponse {

    private UUID vaultId;
    private String linkedMomoNumber;
    private String linkedMomoProvider;
    private boolean momoLinked;
    private LocalDateTime updatedAt;

    public UUID getVaultId() { return vaultId; }
    public void setVaultId(UUID v) { this.vaultId = v; }
    public String getLinkedMomoNumber() { return linkedMomoNumber; }
    public void setLinkedMomoNumber(String v) { this.linkedMomoNumber = v; }
    public String getLinkedMomoProvider() { return linkedMomoProvider; }
    public void setLinkedMomoProvider(String v) { this.linkedMomoProvider = v; }
    public boolean isMomoLinked() { return momoLinked; }
    public void setMomoLinked(boolean v) { this.momoLinked = v; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime v) { this.updatedAt = v; }
}

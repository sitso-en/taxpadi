package com.taxpadi.api.dto.penalty;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class ResolvePenaltyResponse {

    private UUID penaltyId;
    private String taxType;
    private BigDecimal totalPenalty;
    private boolean resolved;
    private LocalDateTime resolvedAt;

    public UUID getPenaltyId() { return penaltyId; }
    public void setPenaltyId(UUID v) { this.penaltyId = v; }
    public String getTaxType() { return taxType; }
    public void setTaxType(String v) { this.taxType = v; }
    public BigDecimal getTotalPenalty() { return totalPenalty; }
    public void setTotalPenalty(BigDecimal v) { this.totalPenalty = v; }
    public boolean isResolved() { return resolved; }
    public void setResolved(boolean v) { this.resolved = v; }
    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime v) { this.resolvedAt = v; }
}

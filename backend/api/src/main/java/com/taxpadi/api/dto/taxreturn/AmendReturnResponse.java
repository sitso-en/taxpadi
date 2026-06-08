package com.taxpadi.api.dto.taxreturn;

import java.time.LocalDateTime;
import java.util.UUID;

public class AmendReturnResponse {

    private UUID returnId;
    private String taxType;
    private String status;
    private String amendmentReason;
    private LocalDateTime amendedAt;

    public UUID getReturnId() { return returnId; }
    public void setReturnId(UUID returnId) { this.returnId = returnId; }

    public String getTaxType() { return taxType; }
    public void setTaxType(String taxType) { this.taxType = taxType; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAmendmentReason() { return amendmentReason; }
    public void setAmendmentReason(String amendmentReason) { this.amendmentReason = amendmentReason; }

    public LocalDateTime getAmendedAt() { return amendedAt; }
    public void setAmendedAt(LocalDateTime amendedAt) { this.amendedAt = amendedAt; }
}

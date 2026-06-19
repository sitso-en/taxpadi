package com.taxpadi.api.dto.admin;

import java.time.LocalDateTime;
import java.util.UUID;

public class AdminUpdateTaxRatesResponse {

    private int taxYear;
    private LocalDateTime updatedAt;
    private UUID updatedBy;

    public AdminUpdateTaxRatesResponse(int taxYear, LocalDateTime updatedAt, UUID updatedBy) {
        this.taxYear = taxYear;
        this.updatedAt = updatedAt;
        this.updatedBy = updatedBy;
    }

    public int getTaxYear() { return taxYear; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public UUID getUpdatedBy() { return updatedBy; }
}

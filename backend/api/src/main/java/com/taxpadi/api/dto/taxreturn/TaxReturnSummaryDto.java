package com.taxpadi.api.dto.taxreturn;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class TaxReturnSummaryDto {

    private UUID returnId;
    private String taxType;
    private int taxYear;
    private LocalDate periodStart;
    private LocalDate periodEnd;
    private BigDecimal taxLiability;
    private String status;
    private LocalDateTime submittedAt;
    private String graReference;
    private LocalDateTime createdAt;

    public TaxReturnSummaryDto(UUID returnId, String taxType, int taxYear,
                                LocalDate periodStart, LocalDate periodEnd,
                                BigDecimal taxLiability, String status,
                                LocalDateTime submittedAt, String graReference,
                                LocalDateTime createdAt) {
        this.returnId = returnId;
        this.taxType = taxType;
        this.taxYear = taxYear;
        this.periodStart = periodStart;
        this.periodEnd = periodEnd;
        this.taxLiability = taxLiability;
        this.status = status;
        this.submittedAt = submittedAt;
        this.graReference = graReference;
        this.createdAt = createdAt;
    }

    public UUID getReturnId() { return returnId; }
    public String getTaxType() { return taxType; }
    public int getTaxYear() { return taxYear; }
    public LocalDate getPeriodStart() { return periodStart; }
    public LocalDate getPeriodEnd() { return periodEnd; }
    public BigDecimal getTaxLiability() { return taxLiability; }
    public String getStatus() { return status; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public String getGraReference() { return graReference; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}

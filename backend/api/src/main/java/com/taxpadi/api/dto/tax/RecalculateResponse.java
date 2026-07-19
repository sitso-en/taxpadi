package com.taxpadi.api.dto.tax;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class RecalculateResponse {
    @JsonProperty("recalculated")
    private boolean recalculated;

    @JsonProperty("tax_types_updated")
    private List<String> taxTypesUpdated;

    @JsonProperty("tax_liability")
    private BigDecimal newTotalLiability;

    @JsonProperty("total_amount_paid")
    private BigDecimal totalAmountPaid;

    @JsonProperty("net_liability")
    private BigDecimal netLiability;

    @JsonProperty("calculated_at")
    private LocalDateTime calculatedAt;

    public RecalculateResponse(boolean recalculated, List<String> taxTypesUpdated,
                                BigDecimal newTotalLiability, BigDecimal totalAmountPaid,
                                BigDecimal netLiability, LocalDateTime calculatedAt) {
        this.recalculated = recalculated;
        this.taxTypesUpdated = taxTypesUpdated;
        this.newTotalLiability = newTotalLiability;
        this.totalAmountPaid = totalAmountPaid;
        this.netLiability = netLiability;
        this.calculatedAt = calculatedAt;
    }

    public boolean isRecalculated() { return recalculated; }
    public List<String> getTaxTypesUpdated() { return taxTypesUpdated; }
    public BigDecimal getNewTotalLiability() { return newTotalLiability; }
    public BigDecimal getTotalAmountPaid() { return totalAmountPaid; }
    public BigDecimal getNetLiability() { return netLiability; }
    public LocalDateTime getCalculatedAt() { return calculatedAt; }
}

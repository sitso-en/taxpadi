package com.taxpadi.api.dto.tax;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class RecalculateResponse {
    private boolean recalculated;
    private List<String> taxTypesUpdated;
    private BigDecimal newTotalLiability;
    private LocalDateTime calculatedAt;

    public RecalculateResponse(boolean recalculated, List<String> taxTypesUpdated,
                                BigDecimal newTotalLiability, LocalDateTime calculatedAt) {
        this.recalculated = recalculated;
        this.taxTypesUpdated = taxTypesUpdated;
        this.newTotalLiability = newTotalLiability;
        this.calculatedAt = calculatedAt;
    }

    public boolean isRecalculated() { return recalculated; }

    public List<String> getTaxTypesUpdated() { return taxTypesUpdated; }

    public BigDecimal getNewTotalLiability() { return newTotalLiability; }
    
    public LocalDateTime getCalculatedAt() { return calculatedAt; }
}

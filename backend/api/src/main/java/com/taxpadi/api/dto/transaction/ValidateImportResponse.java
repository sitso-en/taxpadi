package com.taxpadi.api.dto.transaction;

import java.time.LocalDate;
import java.util.List;

public class ValidateImportResponse {

    private LocalDate detectedFrom;
    private LocalDate detectedTo;
    private int totalTransactionsDetected;
    private Boolean overlapDetected;
    private List<String> overlappingPeriods;
    private Boolean safeToImport;

    public LocalDate getDetectedFrom() { return detectedFrom; }
    public void setDetectedFrom(LocalDate detectedFrom) { this.detectedFrom = detectedFrom; }

    public LocalDate getDetectedTo() { return detectedTo; }
    public void setDetectedTo(LocalDate detectedTo) { this.detectedTo = detectedTo; }

    public int getTotalTransactionsDetected() { return totalTransactionsDetected; }
    public void setTotalTransactionsDetected(int totalTransactionsDetected) { this.totalTransactionsDetected = totalTransactionsDetected; }

    public Boolean getOverlapDetected() { return overlapDetected; }
    public void setOverlapDetected(Boolean overlapDetected) { this.overlapDetected = overlapDetected; }

    public List<String> getOverlappingPeriods() { return overlappingPeriods; }
    public void setOverlappingPeriods(List<String> overlappingPeriods) { this.overlappingPeriods = overlappingPeriods; }

    public Boolean getSafeToImport() { return safeToImport; }
    public void setSafeToImport(Boolean safeToImport) { this.safeToImport = safeToImport; }
}

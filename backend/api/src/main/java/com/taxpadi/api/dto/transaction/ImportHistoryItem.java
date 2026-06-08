package com.taxpadi.api.dto.transaction;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class ImportHistoryItem {

    private UUID importId;
    private String provider;
    private LocalDate statementFrom;
    private LocalDate statementTo;
    private int totalImported;
    private LocalDateTime importedAt;

    public UUID getImportId() { return importId; }
    public void setImportId(UUID importId) { this.importId = importId; }

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }

    public LocalDate getStatementFrom() { return statementFrom; }
    public void setStatementFrom(LocalDate statementFrom) { this.statementFrom = statementFrom; }

    public LocalDate getStatementTo() { return statementTo; }
    public void setStatementTo(LocalDate statementTo) { this.statementTo = statementTo; }

    public int getTotalImported() { return totalImported; }
    public void setTotalImported(int totalImported) { this.totalImported = totalImported; }

    public LocalDateTime getImportedAt() { return importedAt; }
    public void setImportedAt(LocalDateTime importedAt) { this.importedAt = importedAt; }
}

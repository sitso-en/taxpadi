package com.taxpadi.api.dto.transaction;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public class ImportStatementResponse {

    private UUID importId;
    private String provider;
    private LocalDate statementFrom;
    private LocalDate statementTo;
    private int totalTransactionsFound;
    private int transactionsImported;
    private int transactionsSkipped;
    private List<AmbiguousTransactionItem> ambiguousTransactions;
    private Boolean taxLiabilityUpdated;

    public UUID getImportId() { return importId; }
    public void setImportId(UUID importId) { this.importId = importId; }

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }

    public LocalDate getStatementFrom() { return statementFrom; }
    public void setStatementFrom(LocalDate statementFrom) { this.statementFrom = statementFrom; }

    public LocalDate getStatementTo() { return statementTo; }
    public void setStatementTo(LocalDate statementTo) { this.statementTo = statementTo; }

    public int getTotalTransactionsFound() { return totalTransactionsFound; }
    public void setTotalTransactionsFound(int totalTransactionsFound) { this.totalTransactionsFound = totalTransactionsFound; }

    public int getTransactionsImported() { return transactionsImported; }
    public void setTransactionsImported(int transactionsImported) { this.transactionsImported = transactionsImported; }

    public int getTransactionsSkipped() { return transactionsSkipped; }
    public void setTransactionsSkipped(int transactionsSkipped) { this.transactionsSkipped = transactionsSkipped; }

    public List<AmbiguousTransactionItem> getAmbiguousTransactions() { return ambiguousTransactions; }
    public void setAmbiguousTransactions(List<AmbiguousTransactionItem> ambiguousTransactions) { this.ambiguousTransactions = ambiguousTransactions; }

    public Boolean getTaxLiabilityUpdated() { return taxLiabilityUpdated; }
    public void setTaxLiabilityUpdated(Boolean taxLiabilityUpdated) { this.taxLiabilityUpdated = taxLiabilityUpdated; }
}

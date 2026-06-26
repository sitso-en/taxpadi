package com.taxpadi.api.dto.invoice;

import com.taxpadi.api.dto.transaction.VaultSuggestion;

import java.time.LocalDateTime;
import java.util.UUID;

public class MarkPaidResponse {

    private UUID invoiceId;
    private String invoiceRef;
    private String status;
    private LocalDateTime paidAt;
    private boolean transactionCreated;
    private UUID transactionId;
    private boolean taxLiabilityUpdated;
    private VaultSuggestion vaultSuggestion;

    public UUID getInvoiceId() { return invoiceId; }
    public void setInvoiceId(UUID invoiceId) { this.invoiceId = invoiceId; }

    public String getInvoiceRef() { return invoiceRef; }
    public void setInvoiceRef(String invoiceRef) { this.invoiceRef = invoiceRef; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }

    public boolean isTransactionCreated() { return transactionCreated; }
    public void setTransactionCreated(boolean transactionCreated) { this.transactionCreated = transactionCreated; }

    public UUID getTransactionId() { return transactionId; }
    public void setTransactionId(UUID transactionId) { this.transactionId = transactionId; }

    public boolean isTaxLiabilityUpdated() { return taxLiabilityUpdated; }
    public void setTaxLiabilityUpdated(boolean taxLiabilityUpdated) { this.taxLiabilityUpdated = taxLiabilityUpdated; }

    public VaultSuggestion getVaultSuggestion() { return vaultSuggestion; }
    public void setVaultSuggestion(VaultSuggestion vaultSuggestion) { this.vaultSuggestion = vaultSuggestion; }
}

package com.taxpadi.api.dto.taxreturn;

import java.util.List;
import java.util.UUID;

public class PreviewResponse {

    private UUID returnId;
    private TaxpayerInfo taxpayer;
    private ReturnDetails returnDetails;
    private Financials financials;
    private List<PreviewWarning> warnings;
    private boolean readyToSubmit;

    public UUID getReturnId() { return returnId; }
    public void setReturnId(UUID returnId) { this.returnId = returnId; }

    public TaxpayerInfo getTaxpayer() { return taxpayer; }
    public void setTaxpayer(TaxpayerInfo taxpayer) { this.taxpayer = taxpayer; }

    public ReturnDetails getReturnDetails() { return returnDetails; }
    public void setReturnDetails(ReturnDetails returnDetails) { this.returnDetails = returnDetails; }

    public Financials getFinancials() { return financials; }
    public void setFinancials(Financials financials) { this.financials = financials; }

    public List<PreviewWarning> getWarnings() { return warnings; }
    public void setWarnings(List<PreviewWarning> warnings) { this.warnings = warnings; }

    public boolean isReadyToSubmit() { return readyToSubmit; }
    public void setReadyToSubmit(boolean readyToSubmit) { this.readyToSubmit = readyToSubmit; }
}

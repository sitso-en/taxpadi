package com.taxpadi.api.dto.taxreturn;

import jakarta.validation.constraints.NotBlank;

public class AmendReturnRequest {

    @NotBlank(message = "Amendment reason is required")
    private String amendmentReason;

    public String getAmendmentReason() { return amendmentReason; }
    public void setAmendmentReason(String amendmentReason) { this.amendmentReason = amendmentReason; }
}

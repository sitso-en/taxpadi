package com.taxpadi.api.dto.taxreturn;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class SubmitReturnResponse {

    private UUID returnId;
    private String taxType;
    private String status;
    private String graReference;
    private LocalDateTime submittedAt;
    private String nextStep;

    public UUID getReturnId() { return returnId; }
    public void setReturnId(UUID returnId) { this.returnId = returnId; }

    public String getTaxType() { return taxType; }
    public void setTaxType(String taxType) { this.taxType = taxType; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getGraReference() { return graReference; }
    public void setGraReference(String graReference) { this.graReference = graReference; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }

    public String getNextStep() { return nextStep; }
    public void setNextStep(String nextStep) { this.nextStep = nextStep; }
}

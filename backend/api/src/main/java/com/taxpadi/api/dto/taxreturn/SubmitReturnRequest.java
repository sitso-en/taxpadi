package com.taxpadi.api.dto.taxreturn;

import java.time.LocalDateTime;

public class SubmitReturnRequest {

    private String graReference;
    private LocalDateTime submittedAt;

    public String getGraReference() { return graReference; }
    public void setGraReference(String graReference) { this.graReference = graReference; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
}

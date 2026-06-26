package com.taxpadi.api.dto.user;

import java.util.UUID;

public class DataRequestResponse {

    private UUID requestId;
    private String status;
    private Integer estimatedReadyInMinutes;

    public DataRequestResponse(UUID requestId, String status, Integer estimatedReadyInMinutes) {
        this.requestId = requestId;
        this.status = status;
        this.estimatedReadyInMinutes = estimatedReadyInMinutes;
    }


    public UUID getRequestId() {
        return requestId;
    }

    public void setRequestId(UUID requestId) {
        this.requestId = requestId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getEstimatedReadyInMinutes() {
        return estimatedReadyInMinutes;
    }

    public void setEstimatedReadyInMinutes(Integer estimatedReadyInMinutes) {
        this.estimatedReadyInMinutes = estimatedReadyInMinutes;
    }
}
package com.taxpadi.api.dto.payment;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class LinkedPenaltyInfo {
    @JsonProperty("penalty_id")
    private UUID penaltyId;

    public UUID getPenaltyId() { return penaltyId; }
    public void setPenaltyId(UUID v) { this.penaltyId = v; }
}

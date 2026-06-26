package com.taxpadi.api.dto.penalty;

import java.time.LocalDateTime;

public class ResolvePenaltyRequest {

    private LocalDateTime resolvedAt;

    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime v) { this.resolvedAt = v; }
}

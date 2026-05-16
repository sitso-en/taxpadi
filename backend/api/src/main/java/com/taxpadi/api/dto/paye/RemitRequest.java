package com.taxpadi.api.dto.paye;

import java.time.LocalDateTime;

public class RemitRequest {

    private LocalDateTime remittedAt;

    public LocalDateTime getRemittedAt() { return remittedAt; }
    public void setRemittedAt(LocalDateTime remittedAt) { this.remittedAt = remittedAt; }
}

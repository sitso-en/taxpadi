package com.taxpadi.api.dto.withholding;

import java.time.LocalDateTime;

public class WhtRemitRequest {

    private LocalDateTime remittedAt;

    public LocalDateTime getRemittedAt() { return remittedAt; }
    public void setRemittedAt(LocalDateTime remittedAt) { this.remittedAt = remittedAt; }
}

package com.taxpadi.api.dto.user;

import java.time.LocalDateTime;
import java.util.UUID;

public class RevokeSessionResponse {

    private UUID tokenId;
    private String deviceInfo;
    private LocalDateTime revokedAt;

    public RevokeSessionResponse(UUID tokenId, String deviceInfo, LocalDateTime revokedAt) {
        this.tokenId = tokenId;
        this.deviceInfo = deviceInfo;
        this.revokedAt = revokedAt;
    }


    public UUID getTokenId() {
        return tokenId;
    }

    public void setTokenId(UUID tokenId) {
        this.tokenId = tokenId;
    }

    public String getDeviceInfo() {
        return deviceInfo;
    }

    public void setDeviceInfo(String deviceInfo) {
        this.deviceInfo = deviceInfo;
    }

    public LocalDateTime getRevokedAt() {
        return revokedAt;
    }

    public void setRevokedAt(LocalDateTime revokedAt) {
        this.revokedAt = revokedAt;
    }
}
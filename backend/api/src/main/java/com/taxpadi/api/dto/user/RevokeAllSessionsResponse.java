package com.taxpadi.api.dto.user;

public class RevokeAllSessionsResponse {

    private int sessionsRevoked;

    public RevokeAllSessionsResponse(int sessionsRevoked) {
        this.sessionsRevoked = sessionsRevoked;
    }

    public int getSessionsRevoked() {
        return sessionsRevoked;
    }

    public void setSessionsRevoked(int sessionsRevoked) {
        this.sessionsRevoked = sessionsRevoked;
    }
}

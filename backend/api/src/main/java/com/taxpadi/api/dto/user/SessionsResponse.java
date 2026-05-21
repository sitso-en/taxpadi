package com.taxpadi.api.dto.user;

import java.util.List;

public class SessionsResponse {
    private List<SessionDto> sessions;

    public SessionsResponse(List<SessionDto> sessions) {
        this.sessions = sessions;
    }

    public List<SessionDto> getSessions() {
        return sessions;
    }

    public void setSessions(List<SessionDto> sessions) {
        this.sessions = sessions;
    }

    
}

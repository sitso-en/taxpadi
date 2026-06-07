package com.taxpadi.api.dto.notification;

public class NotificationPreferencesResponse {

    private NotificationPreferences preferences;

    public NotificationPreferencesResponse(NotificationPreferences preferences) {
        this.preferences = preferences;
    }

    public NotificationPreferences getPreferences() { return preferences; }
    public void setPreferences(NotificationPreferences preferences) { this.preferences = preferences; }
}

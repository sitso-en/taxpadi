package com.taxpadi.api.dto.notification;

import com.taxpadi.api.dto.common.PaginationInfo;

import java.util.List;

public class NotificationListResponse {

    private List<NotificationItem> notifications;
    private PaginationInfo pagination;

    public NotificationListResponse(List<NotificationItem> notifications, PaginationInfo pagination) {
        this.notifications = notifications;
        this.pagination = pagination;
    }

    public List<NotificationItem> getNotifications() { return notifications; }
    public void setNotifications(List<NotificationItem> notifications) { this.notifications = notifications; }

    public PaginationInfo getPagination() { return pagination; }
    public void setPagination(PaginationInfo pagination) { this.pagination = pagination; }
}

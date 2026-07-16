export interface Notification {
  notification_id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  action_url: string;
  created_at: string;
}

export interface NotificationsResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      total_pages: number;
    };
  };
  message: string;
  timestamp: string;
}
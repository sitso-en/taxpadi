import client from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

export const getNotifications = async (
  page = 1,
  limit = 20
) => {
  const response = await client.get(ENDPOINTS.NOTIFICATIONS.LIST, {
    params: { page, limit },
  });

  return response.data;
};

export const getUnreadCount = async () => {
  const response = await client.get(
    ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT
  );

  return response.data;
};

export const markNotificationAsRead = async (id: string) => {
  const response = await client.patch(
    ENDPOINTS.NOTIFICATIONS.MARK_READ(id)
  );

  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await client.patch(
    ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ
  );

  return response.data;
};

export const deleteNotification = async (id: string) => {
  const response = await client.delete(
    ENDPOINTS.NOTIFICATIONS.DELETE(id)
  );

  return response.data;
};

export const deleteAllNotifications = async () => {
  const response = await client.delete(
    ENDPOINTS.NOTIFICATIONS.DELETE_ALL
  );

  return response.data;
};

export const registerNotificationToken = async (payload: {
  fcm_token: string;
  platform: string;
}) => {
  const response = await client.post(
    ENDPOINTS.NOTIFICATIONS.REGISTER,
    payload
  );

  return response.data;
};
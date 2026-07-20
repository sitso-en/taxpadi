import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";

import { getUnreadCount, registerNotificationToken } from "@/services/notification.service";
import { getDeviceToken } from "@/services/notifications.service";

// Show notifications as banners even when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

type NotificationContextType = {
  unreadCount: number;
  refreshUnreadCount: () => void;
};

const NotificationContext = createContext<NotificationContextType>({
  unreadCount: 0,
  refreshUnreadCount: () => {},
});

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const res = await getUnreadCount();
      setUnreadCount(res.data?.unread_count ?? 0);
    } catch {
      // silently ignore — badge just shows stale count
    }
  }, []);

  useEffect(() => {
    refreshUnreadCount();
  }, [refreshUnreadCount]);

  // Register push token with backend (best-effort, silent on failure)
  useEffect(() => {
    const register = async () => {
      try {
        const tokenData = await getDeviceToken();
        if (tokenData) {
          await registerNotificationToken({
            fcm_token: tokenData.token,
            platform: tokenData.platform,
          });
        }
      } catch {
        // Non-fatal — push notifications just won't work until next app open
      }
    };
    register();
  }, []);

  // Handle notification taps — deep-link to the relevant screen
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const url = response.notification.request.content.data?.url as
          | string
          | undefined;
        if (url) {
          router.push(url as any);
        }
      }
    );
    return () => sub.remove();
  }, []);

  return (
    <NotificationContext.Provider value={{ unreadCount, refreshUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);

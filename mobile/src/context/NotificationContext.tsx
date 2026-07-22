import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import Constants from "expo-constants";
import { router } from "expo-router";

import { getUnreadCount, registerNotificationToken } from "@/services/notification.service";
import { getDeviceToken } from "@/services/notifications.service";

// expo-notifications remote push APIs were removed from Expo Go in SDK 53.
// Lazy-require so the module evaluation never throws in Expo Go.
const IS_EXPO_GO = Constants.executionEnvironment === "storeClient";

type NotificationsModule = typeof import("expo-notifications");
let Notifications: NotificationsModule | null = null;
if (!IS_EXPO_GO) {
  try {
    Notifications = require("expo-notifications") as NotificationsModule;
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  } catch {
    Notifications = null;
  }
}

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
    if (!Notifications) return;
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
    if (!Notifications) return;
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

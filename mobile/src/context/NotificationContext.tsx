import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Notification = {
  id: number;
  title: string;
  message: string;
  date: string;
  read: boolean;
};

type NotificationContextType = {
  notifications: Notification[];

  unreadCount: number;

  addNotification: (
    title: string,
    message: string
  ) => void;

  markAsRead: (
    id: number
  ) => void;

  markAllAsRead: () => void;

  deleteNotification: (
    id: number
  ) => void;

  clearNotifications: () => void;
};

const NotificationContext =
  createContext<NotificationContextType>(
    {} as NotificationContextType
  );

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [loaded, setLoaded] =
    useState(false);

  // Load notifications

  useEffect(() => {
    const loadNotifications =
      async () => {
        try {
          const stored =
            await AsyncStorage.getItem(
              "notifications"
            );

          if (stored) {
            setNotifications(
              JSON.parse(stored)
            );
          }

          setLoaded(true);
        } catch (error) {
          console.log(
            "Failed loading notifications",
            error
          );

          setLoaded(true);
        }
      };

    loadNotifications();
  }, []);

  // Save notifications

  useEffect(() => {
    if (!loaded) return;

    AsyncStorage.setItem(
      "notifications",
      JSON.stringify(notifications)
    );
  }, [notifications, loaded]);

  // Unread count

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (notification) =>
          !notification.read
      ).length,

    [notifications]
  );

  // Add notification

  const addNotification = (
    title: string,
    message: string
  ) => {
    const newNotification: Notification =
      {
        id: Date.now(),

        title,

        message,

        date:
          new Date().toISOString(),

        read: false,
      };

    setNotifications((prev) => [
      newNotification,
      ...prev,
    ]);
  };

  // Mark one as read

  const markAsRead = (
    id: number
  ) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              read: true,
            }
          : notification
      )
    );
  };

  // Mark all as read

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  // Delete notification

  const deleteNotification = (
    id: number
  ) => {
    setNotifications((prev) =>
      prev.filter(
        (notification) =>
          notification.id !== id
      )
    );
  };

  // Clear all notifications

  const clearNotifications =
    () => {
      setNotifications([]);
    };

  return (
    <NotificationContext.Provider
      value={{
        notifications,

        unreadCount,

        addNotification,

        markAsRead,

        markAllAsRead,

        deleteNotification,

        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications =
  () =>
    useContext(
      NotificationContext
    );
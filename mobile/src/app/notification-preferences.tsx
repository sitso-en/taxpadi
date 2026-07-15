import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification as deleteNotificationApi,
  deleteAllNotifications,
} from "@/services/notification.service";
import { getUserFriendlyError } from "@/utils/error";

export default function NotificationPreferencesScreen() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [markingAll, setMarkingAll] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);

  const loadNotifications = async () => {
    try {
      const notificationsResponse = await getNotifications();
      const unreadResponse = await getUnreadCount();

      setNotifications(
        notificationsResponse.data.notifications
      );

      setUnreadCount(
        unreadResponse.data.unread_count
      );
    } catch (error) {
      console.log(error);
     Alert.alert(
  "Unable to Update Notification Preferences",
  getUserFriendlyError(error)
);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const getIconConfig = (title: string) => {
    const text = title.toLowerCase();

    if (text.includes("payment")) {
      return { name: "checkmark-circle-outline", color: "#34A853", bg: "#E6F4EA" };
    }
    if (text.includes("deadline")) {
      return { name: "calendar-outline", color: "#FBBC05", bg: "#FEF7E0" };
    }
    if (text.includes("vat")) {
      return { name: "document-text-outline", color: "#4285F4", bg: "#E8F0FE" };
    }
    if (text.includes("savings")) {
      return { name: "wallet-outline", color: "#A736C4", bg: "#F3E6F8" };
    }
    if (text.includes("penalty")) {
      return { name: "warning-outline", color: "#EA4335", bg: "#FCE8E6" };
    }
    return { name: "notifications-outline", color: "#6B7280", bg: "#F3F4F6" };
  };

  const formatTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString();
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Notification",
      "Remove this notification?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteNotificationApi(id);
              await loadNotifications();
            } catch (error) {
              Alert.alert("Error", "Failed to delete notification.");
            }
          },
        },
      ],
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      "Clear Notifications",
      "Delete all notifications?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            if (clearingAll) return;

            setClearingAll(true);

            try {
              await deleteAllNotifications();
              await loadNotifications();
            } catch (error: any) {
              Alert.alert(
                "Error",
                error?.response?.data?.message ??
                  "Unable to clear notifications."
              );
            } finally {
              setClearingAll(false);
            }
          },
        },
      ],
    );
  };

  const handleMarkAllAsRead = async () => {
    if (markingAll) return;

    setMarkingAll(true);

    try {
      await markAllNotificationsAsRead();
      await loadNotifications();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message ??
          "Unable to mark notifications as read."
      );
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingBottom: 60,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/dashboard");
            }
          }}
        >
          <Ionicons name="chevron-back" size={26} color="#111827" />
        </TouchableOpacity>

        <Text style={styles.title}>Notifications</Text>
      </View>

      <Text style={styles.subtitle}>
        Stay updated with payments, reminders and tax activity.
      </Text>

      <View style={styles.summaryCard}>
        <View style={styles.summaryIcon}>
          <Ionicons name="notifications-outline" size={28} color="#FFFFFF" />
        </View>
        <View>
          <Text style={styles.summaryTitle}>Notifications</Text>
          <Text style={styles.summarySubtitle}>
            {unreadCount} unread • {notifications.length} total notifications
          </Text>
        </View>
      </View>

      {notifications.length > 0 && (
        <View style={styles.topRow}>
          <View style={styles.actionsRow}>
            {unreadCount > 0 && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleMarkAllAsRead}
                disabled={markingAll}
              >
                <Text style={styles.actionText}>
                  {markingAll ? "Marking..." : "Mark All Read"}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleClearAll}
              disabled={clearingAll}
            >
              <Text style={styles.actionText}>
                {clearingAll ? "Clearing..." : "Clear All"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {notifications.length === 0 && (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="notifications-off-outline" size={40} color="#C44736" />
          </View>
          <Text style={styles.emptyTitle}>You're all caught up</Text>
          <Text style={styles.emptyText}>
            New notifications will appear here.
          </Text>
        </View>
      )}

      {notifications.map((item) => {
        const iconConfig = getIconConfig(item.title);

        return (
          <TouchableOpacity
            key={item.notification_id}
            style={[
              styles.notificationCard,
              !item.read && styles.unreadNotification,
            ]}
            onPress={async () => {
              if (!item.read) {
                try {
                  await markNotificationAsRead(item.notification_id);
                  await loadNotifications();
                } catch (error) {
                  console.log(error);
                }
              }
            }}
            onLongPress={() => handleDelete(item.notification_id)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconCircle, { backgroundColor: iconConfig.bg }]}>
              <Ionicons
                name={iconConfig.name as any}
                size={22}
                color={iconConfig.color}
              />
            </View>

            <View style={styles.content}>
              <View style={styles.notificationHeader}>
                <Text style={styles.notificationTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.time}>
                  {formatTime(item.created_at)}
                </Text>
              </View>

              <Text style={styles.message}>{item.body}</Text>
            </View>

            {!item.read && <View style={styles.redDot} />}
          </TouchableOpacity>
        );
      })}

      {notifications.length > 0 && (
        <Text style={styles.hintText}>
          Long press a notification to delete it.
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 16,
    paddingTop: 44,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    color: "#111827",
    fontFamily: "Inter_700Bold",
    marginLeft: 10,
  },

  subtitle: {
    color: "#6B7280",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 0,
    marginBottom: 18,
    lineHeight: 18,
  },

  summaryCard: {
    backgroundColor: "#C44736",
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  summaryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },

  summaryTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },

  summarySubtitle: {
    color: "#FDECEC",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 16,
  },

  actionsRow: {
    flexDirection: "row",
    gap: 12,
  },

  actionButton: {
    backgroundColor: "#FFF5F3",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },

  actionText: {
    color: "#C44736",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },

  notificationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ECECEC",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  unreadNotification: {
    borderWidth: 1,
    borderColor: "#FCE8E6",
    borderLeftWidth: 4,
    borderLeftColor: "#C44736",
    backgroundColor: "#FFFDFC",
  },

  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
  },

  content: {
    flex: 1,
    marginLeft: 14,
  },

  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },

  notificationTitle: {
    color: "#111827",
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    flex: 1,
    paddingRight: 8,
  },

  time: {
    color: "#9CA3AF",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    width: 65,
    textAlign: "right",
  },

  message: {
    color: "#6B7280",
    lineHeight: 18,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },

  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#C44736",
    marginLeft: 10,
    alignSelf: "center",
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    paddingHorizontal: 30,
  },

  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFF5F3",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 18,
    color: "#111827",
    fontFamily: "Inter_700Bold",
    marginBottom: 6,
  },

  emptyText: {
    color: "#6B7280",
    textAlign: "center",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },

  hintText: {
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 12,
  },
});
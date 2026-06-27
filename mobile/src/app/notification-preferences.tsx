import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useNotifications } from "../context/NotificationContext";

import React from "react";

import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function NotificationPreferencesScreen() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearNotifications,
  } = useNotifications();

  const getIcon = (title: string) => {
    const text = title.toLowerCase();

    if (text.includes("payment"))
      return "checkmark-circle-outline";

    if (
      text.includes("deadline")
    )
      return "calendar-outline";

    if (text.includes("vat"))
      return "document-text-outline";

    if (
      text.includes("savings")
    )
      return "wallet-outline";

    if (
      text.includes("penalty")
    )
      return "warning-outline";

    return "notifications-outline";
  };

  const formatTime = (
    dateString: string
  ) => {
    const now = new Date();

    const date = new Date(
      dateString
    );

    const diff =
      now.getTime() -
      date.getTime();

    const minutes = Math.floor(
      diff / (1000 * 60)
    );

    const hours = Math.floor(
      diff / (1000 * 60 * 60)
    );

    const days = Math.floor(
      diff /
        (1000 *
          60 *
          60 *
          24)
    );

    if (minutes < 1)
      return "Just now";

    if (minutes < 60)
      return `${minutes}m ago`;

    if (hours < 24)
      return `${hours}h ago`;

    if (days === 1)
      return "Yesterday";

    if (days < 7)
      return `${days} days ago`;

    return date.toLocaleDateString();
  };

  const handleDelete = (
    id: number
  ) => {
    Alert.alert(
      "Delete Notification",
      "Remove this notification?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },

        {
          text: "Delete",
          style: "destructive",

          onPress: () =>
            deleteNotification(id),
        },
      ]
    );
  };

  const handleClearAll =
    () => {
      Alert.alert(
        "Clear Notifications",
        "Delete all notifications?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },

          {
            text: "Clear",
            style:
              "destructive",

            onPress:
              clearNotifications,
          },
        ]
      );
    };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingBottom: 50,
      }}
      showsVerticalScrollIndicator={
        false
      }
    >
      {/* Header */}

      <View
        style={styles.header}
      >
        <TouchableOpacity
          onPress={() => {
            if (
              router.canGoBack()
            ) {
              router.back();
            } else {
              router.replace(
                "/dashboard"
              );
            }
          }}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#111827"
          />
        </TouchableOpacity>

        <Text
          style={styles.title}
        >
          Notifications
        </Text>
      </View>

      {/* Top Row */}

      <View
        style={styles.topRow}
      >
        <View
          style={
            styles.unreadBadge
          }
        >
          <Text
            style={
              styles.unreadText
            }
          >
            {unreadCount} unread
          </Text>
        </View>

        <View
          style={
            styles.actionsRow
          }
        >
          {unreadCount >
            0 && (
            <TouchableOpacity
              onPress={
                markAllAsRead
              }
            >
              <Text
                style={
                  styles.actionText
                }
              >
                Mark all read
              </Text>
            </TouchableOpacity>
          )}

          {notifications.length >
            0 && (
            <TouchableOpacity
              onPress={
                handleClearAll
              }
            >
              <Text
                style={
                  styles.actionText
                }
              >
                Clear all
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Empty State */}

      {notifications.length ===
        0 && (
        <View
          style={
            styles.emptyContainer
          }
        >
          <Ionicons
            name="notifications-off-outline"
            size={60}
            color="#9CA3AF"
          />

          <Text
            style={
              styles.emptyTitle
            }
          >
            No Notifications
            Yet
          </Text>

          <Text
            style={
              styles.emptyText
            }
          >
            New alerts,
            reminders and
            updates will
            appear here.
          </Text>
        </View>
      )}

      {/* Notifications */}

      {notifications.map(
        (item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.notificationCard,

              !item.read &&
                styles.unreadNotification,
            ]}
            onPress={() => {
              if (
                !item.read
              ) {
                markAsRead(
                  item.id
                );
              }
            }}
            onLongPress={() =>
              handleDelete(
                item.id
              )
            }
          >
            <Ionicons
              name={
                getIcon(
                  item.title
                ) as any
              }
              size={22}
              color="#6B7280"
              style={{
                marginTop: 4,
              }}
            />

            <View
              style={
                styles.content
              }
            >
              <View
                style={
                  styles.notificationHeader
                }
              >
                <Text
                  style={
                    styles.notificationTitle
                  }
                >
                  {item.title}
                </Text>

                <Text
                  style={
                    styles.time
                  }
                >
                  {formatTime(
                    item.date
                  )}
                </Text>
              </View>

              <Text
                style={
                  styles.message
                }
              >
                {item.message}
              </Text>
            </View>

            {!item.read && (
              <View
                style={
                  styles.redDot
                }
              />
            )}
          </TouchableOpacity>
        )
      )}
    </ScrollView>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        "#FAFAFA",
      paddingHorizontal: 20,
      paddingTop: 55,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 24,
    },

    title: {
      fontSize: 30,
      color: "#111827",
      fontFamily:
        "Inter_700Bold",
      marginLeft: 10,
    },

    topRow: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
      marginBottom: 20,
    },

    unreadBadge: {
      backgroundColor:
        "#FCE8E6",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },

    unreadText: {
      color: "#C44736",
      fontSize: 12,
      fontFamily:
        "Inter_600SemiBold",
    },

    actionsRow: {
      flexDirection: "row",
      gap: 16,
    },

    actionText: {
      color: "#C44736",
      fontFamily:
        "Inter_600SemiBold",
    },

    notificationCard: {
      backgroundColor:
        "#FFFFFF",
      borderRadius: 18,
      padding: 18,
      marginBottom: 14,
      flexDirection: "row",
      alignItems:
        "flex-start",
    },

    unreadNotification: {
      borderWidth: 1,
      borderColor:
        "#FCE8E6",
      backgroundColor:
        "#FFFDFC",
    },

    content: {
      flex: 1,
      marginLeft: 14,
    },

    notificationHeader: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      marginBottom: 6,
    },

    notificationTitle: {
      color: "#111827",
      fontFamily:
        "Inter_600SemiBold",
      flex: 1,
    },

    time: {
      color: "#9CA3AF",
      fontSize: 12,
      marginLeft: 8,
    },

    message: {
      color: "#6B7280",
      lineHeight: 18,
      fontSize: 13,
    },

    redDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor:
        "#C44736",
      marginLeft: 10,
      marginTop: 6,
    },

    emptyContainer: {
      alignItems: "center",
      marginTop: 60,
      paddingHorizontal: 30,
    },

    emptyTitle: {
      marginTop: 16,
      fontSize: 18,
      color: "#111827",
      fontFamily:
        "Inter_700Bold",
    },

    emptyText: {
      marginTop: 8,
      color: "#6B7280",
      textAlign: "center",
      lineHeight: 20,
    },
  });
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Session = {
  id: number;
  deviceName: string;
  icon:
    | "desktop-outline"
    | "phone-portrait-outline"
    | "laptop-outline";
  ipAddress: string;
  loginDate: string;
  lastActivity: string;
  current: boolean;
};

export default function ActiveSessionsScreen() {
  const currentSession: Session =
    useMemo(() => {
      const deviceName =
        Platform.OS === "web"
          ? "Web Browser"
          : Platform.OS === "ios"
          ? "iPhone"
          : "Android Device";

      return {
        id: 1,
        deviceName,

        icon:
          Platform.OS === "web"
            ? "desktop-outline"
            : "phone-portrait-outline",

        ipAddress:
          "Current Network",

        loginDate:
          new Date().toLocaleString(),

        lastActivity: "Just now",

        current: true,
      };
    }, []);

  const [sessions, setSessions] =
    useState<Session[]>([]);

  const [loaded, setLoaded] =
    useState(false);

  // Load sessions
  useEffect(() => {
    const loadSessions =
      async () => {
        try {
          const stored =
            await AsyncStorage.getItem(
              "activeSessions"
            );

          if (stored) {
            const parsed =
              JSON.parse(stored);

            const hasCurrent =
              parsed.some(
                (session: Session) =>
                  session.current
              );

            if (!hasCurrent) {
              setSessions([
                currentSession,
                ...parsed,
              ]);
            } else {
              setSessions(parsed);
            }
          } else {
            setSessions([
              currentSession,

              {
                id: 2,

                deviceName:
                  "MacBook Pro",

                icon:
                  "laptop-outline",

                ipAddress:
                  "172.16.0.10",

                loginDate:
                  new Date(
                    Date.now() -
                      1000 *
                        60 *
                        60 *
                        24 *
                        2
                  ).toLocaleString(),

                lastActivity:
                  "2 hours ago",

                current: false,
              },

              {
                id: 3,

                deviceName:
                  "iPhone 13",

                icon:
                  "phone-portrait-outline",

                ipAddress:
                  "10.0.0.25",

                loginDate:
                  new Date(
                    Date.now() -
                      1000 *
                        60 *
                        60 *
                        24 *
                        5
                  ).toLocaleString(),

                lastActivity:
                  "Yesterday",

                current: false,
              },
            ]);
          }

          setLoaded(true);
        } catch (error) {
          console.log(
            "Failed loading sessions",
            error
          );

          setSessions([
            currentSession,
          ]);

          setLoaded(true);
        }
      };

    loadSessions();
  }, []);

  // Save sessions
  useEffect(() => {
    if (!loaded) return;

    AsyncStorage.setItem(
      "activeSessions",
      JSON.stringify(sessions)
    );
  }, [sessions, loaded]);

  const logoutDevice = (
    id: number
  ) => {
    if (Platform.OS === "web") {
      setSessions((prev) =>
        prev.filter(
          (session) =>
            session.id !== id
        )
      );

      alert(
        "Device logged out successfully."
      );

      return;
    }

    Alert.alert(
      "Log Out Device",
      "Are you sure you want to log out this device?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },

        {
          text: "Log Out",
          style: "destructive",

          onPress: () => {
            setSessions((prev) =>
              prev.filter(
                (session) =>
                  session.id !== id
              )
            );

            Alert.alert(
              "Success",
              "Device logged out successfully."
            );
          },
        },
      ]
    );
  };

  const logoutAllOtherDevices =
    () => {
      if (sessions.length <= 1) {
        Alert.alert(
          "No Other Devices",
          "You are only signed in on this device."
        );

        return;
      }

      if (Platform.OS === "web") {
        setSessions((prev) =>
          prev.filter(
            (session) =>
              session.current
          )
        );

        alert(
          "All other devices have been logged out."
        );

        return;
      }

      Alert.alert(
        "Log Out All Devices",
        "This will sign out all devices except this one.",
        [
          {
            text: "Cancel",
            style: "cancel",
          },

          {
            text: "Continue",
            style: "destructive",

            onPress: () => {
              setSessions((prev) =>
                prev.filter(
                  (session) =>
                    session.current
                )
              );

              Alert.alert(
                "Success",
                "All other devices have been logged out."
              );
            },
          },
        ]
      );
    };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingBottom: 40,
      }}
      showsVerticalScrollIndicator={
        false
      }
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() =>
            router.back()
          }
        >
          <Ionicons
            name="chevron-back"
            size={28}
            color="#222"
          />
        </TouchableOpacity>

        <Text style={styles.title}>
          Active Sessions
        </Text>
      </View>

      <Text style={styles.subtitle}>
        Manage devices currently signed into your account.
      </Text>

      {sessions.length > 1 && (
        <TouchableOpacity
          style={styles.logoutAll}
          onPress={
            logoutAllOtherDevices
          }
        >
          <Ionicons
            name="log-out-outline"
            size={20}
            color="#FFFFFF"
          />

          <Text style={styles.logoutAllText}>
            Log Out All Other Devices
          </Text>
        </TouchableOpacity>
      )}

      {sessions.length === 1 && (
        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerText}>
            No other active devices found.
          </Text>
        </View>
      )}

      {sessions.map((session) => (
        <View
          key={session.id}
          style={[
            styles.card,

            session.current &&
              styles.currentCard,
          ]}
        >
          <View style={styles.row}>
            <Ionicons
              name={session.icon}
              size={24}
              color={
                session.current
                  ? "#C44736"
                  : "#222"
              }
            />

            <Text style={styles.deviceName}>
              {session.deviceName}
            </Text>
          </View>

          {session.current && (
            <Text style={styles.currentBadge}>
              Current Session
            </Text>
          )}

          <Text style={styles.info}>
            IP: {session.ipAddress}
          </Text>

          <Text style={styles.info}>
            Signed In:{" "}
            {session.loginDate}
          </Text>

          <Text style={styles.info}>
            Last Activity:{" "}
            {session.lastActivity}
          </Text>

          {!session.current && (
            <TouchableOpacity
              style={
                styles.logoutButton
              }
              onPress={() =>
                logoutDevice(
                  session.id
                )
              }
            >
              <Ionicons
                name="log-out-outline"
                size={18}
                color="#C44736"
              />

              <Text style={styles.logoutText}>
                Log Out Device
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        "#FAFAFA",
      padding: 20,
      paddingTop: 55,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
    },

    title: {
      fontSize: 34,
      color: "#111827",
      fontFamily: "Inter_700Bold",
      marginLeft: 10,
    },

    subtitle: {
      color: "#6B7280",
      fontSize: 15,
      fontFamily: "Inter_400Regular",
      marginTop: -4,
      marginBottom: 26,
    },

    logoutAll: {
      backgroundColor: "#C44736",
      paddingVertical: 18,
      borderRadius: 16,
      marginBottom: 22,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",

      shadowColor: "#000",
      shadowOpacity: 0.12,
      shadowRadius: 10,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      elevation: 5,
    },

    logoutAllText: {
      color: "#FFFFFF",
      marginLeft: 8,
      fontFamily:
        "Inter_600SemiBold",
    },

    infoBanner: {
      backgroundColor: "#FFFFFF",
      borderRadius: 16,
      padding: 18,
      marginBottom: 22,
      borderWidth: 1,
      borderColor: "#ECECEC",
    },

    infoBannerText: {
      textAlign: "center",
      color: "#6B7280",
      fontFamily:
        "Inter_500Medium",
    },

    card: {
      backgroundColor: "#FFFFFF",
      borderRadius: 18,
      padding: 20,
      marginBottom: 16,

      borderWidth: 1,
      borderColor: "#ECECEC",

      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 8,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      elevation: 2,
    },

    currentCard: {
      borderWidth: 2,
      borderColor:
        "#C44736",
    },

    row: {
      flexDirection: "row",
      alignItems: "center",
    },

    deviceName: {
      fontSize: 18,
      marginLeft: 10,
      color: "#111827",
      fontFamily:
        "Inter_600SemiBold",
    },

    currentBadge: {
      alignSelf: "flex-start",
      marginTop: 12,
      backgroundColor: "#FCE8E6",
      color: "#C44736",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
      overflow: "hidden",
      fontSize: 12,
      fontFamily: "Inter_600SemiBold",
    },

    info: {
      color: "#6B7280",
      marginTop: 6,
      fontFamily:
        "Inter_400Regular",
    },

    logoutButton: {
      backgroundColor:
        "#FCE8E6",
      borderRadius: 10,
      padding: 12,
      marginTop: 14,
      flexDirection: "row",
      justifyContent:
        "center",
      alignItems: "center",
    },

    logoutText: {
      color: "#C44736",
      marginLeft: 6,
      fontFamily:
        "Inter_600SemiBold",
    },
  });
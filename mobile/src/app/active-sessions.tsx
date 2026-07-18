import React, { useCallback, useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  getSessions,
  revokeAllSessions,
  revokeSession,
} from "../services/sessions.service";
import { getUserFriendlyError } from "@/utils/error";
import { useToast } from "@/context/ToastContext";

type Session = {
  token_id: string;
  device_name: string;
  ip_address: string;
  created_at: string;
  last_used_at: string;
  current: boolean;
};

export default function ActiveSessionsScreen() {
  const { showToast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await getSessions();
      setSessions(res.data?.sessions ?? []);
    } catch (error: any) {
      showToast(getUserFriendlyError(error), "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const logoutDevice = async (tokenId: string) => {
    setRevoking(tokenId);
    try {
      await revokeSession(tokenId);
      setSessions((prev) => prev.filter((s) => s.token_id !== tokenId));
    } catch (error: any) {
      showToast(getUserFriendlyError(error), "error");
    } finally {
      setRevoking(null);
    }
  };

  const logoutAllOtherDevices = async () => {
    const others = sessions.filter((s) => !s.current);
    if (others.length === 0) {
      showToast("You are only signed in on this device.", "info");
      return;
    }

    setRevoking("all");
    try {
      await revokeAllSessions();
      setSessions((prev) => prev.filter((s) => s.current));
    } catch (error: any) {
      showToast(getUserFriendlyError(error), "error");
    } finally {
      setRevoking(null);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#C44736" />
      </View>
    );
  }

  const hasOthers = sessions.some((s) => !s.current);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 48 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Active Sessions</Text>
      </View>

      <Text style={styles.subtitle}>
        Manage devices currently signed into your account.
      </Text>

      {hasOthers && (
        <TouchableOpacity
          style={[styles.logoutAll, revoking === "all" && { opacity: 0.7 }]}
          onPress={logoutAllOtherDevices}
        >
          {revoking === "all" ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
              <Text style={styles.logoutAllText}>
                Log Out All Other Devices
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {!hasOthers && sessions.length > 0 && (
        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerText}>
            No other active devices found.
          </Text>
        </View>
      )}

      {sessions.map((session) => (
        <View
          key={session.token_id}
          style={[styles.card, session.current && styles.currentCard]}
        >
          <View style={styles.row}>
            <Ionicons
              name="phone-portrait-outline"
              size={24}
              color={session.current ? "#C44736" : "#222"}
            />
            <Text style={styles.deviceName}>
              {session.device_name ?? "Unknown Device"}
            </Text>
          </View>

          {session.current && (
            <Text style={styles.currentBadge}>Current Session</Text>
          )}

          <Text style={styles.info}>IP: {session.ip_address ?? "—"}</Text>
          <Text style={styles.info}>
            Signed In: {formatDate(session.created_at)}
          </Text>
          <Text style={styles.info}>
            Last Active: {formatDate(session.last_used_at)}
          </Text>

          {!session.current && (
            <TouchableOpacity
              style={[
                styles.logoutButton,
                revoking === session.token_id && { opacity: 0.7 },
              ]}
              onPress={() => logoutDevice(session.token_id)}
                >
              {revoking === session.token_id ? (
                <ActivityIndicator color="#C44736" size="small" />
              ) : (
                <>
                  <Ionicons name="log-out-outline" size={18} color="#C44736" />
                  <Text style={styles.logoutText}>Log Out Device</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2EDE8",
    paddingHorizontal: 16,
    paddingTop: 44,
  },

  centered: {
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
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
    marginBottom: 20,
  },

  logoutAll: {
    backgroundColor: "#C44736",
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },

  logoutAllText: {
    color: "#FFFFFF",
    marginLeft: 8,
    fontFamily: "Inter_600SemiBold",
  },

  infoBanner: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ECECEC",
  },

  infoBannerText: {
    textAlign: "center",
    color: "#6B7280",
    fontFamily: "Inter_500Medium",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ECECEC",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  currentCard: {
    borderWidth: 2,
    borderColor: "#C44736",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  deviceName: {
    fontSize: 15,
    marginLeft: 10,
    color: "#111827",
    fontFamily: "Inter_600SemiBold",
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
    fontSize: 12,
    marginTop: 5,
    fontFamily: "Inter_400Regular",
  },

  logoutButton: {
    backgroundColor: "#FCE8E6",
    borderRadius: 10,
    padding: 12,
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  logoutText: {
    color: "#C44736",
    marginLeft: 6,
    fontFamily: "Inter_600SemiBold",
  },
});

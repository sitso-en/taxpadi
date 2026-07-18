import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { formatCategory } from "@/utils/error";
import { getSubscriptionStatus } from "@/services/subscriptions.service";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const PLAN_NICKNAMES: Record<string, string> = {
  free: "wiggly_faraday",
  monthly: "peppy_kepler",
  annual: "goofy_euler",
};

export default function TaxProfileScreen() {
  const { user } = useUser();
  const [planNickname, setPlanNickname] = useState(PLAN_NICKNAMES.free);

  useEffect(() => {
    getSubscriptionStatus()
      .then((res) => {
        const data = res.data ?? res;
        const tier = data.subscription_tier ?? "free";
        const plan = data.plan ?? (tier === "paid" ? "monthly" : "free");
        setPlanNickname(
          PLAN_NICKNAMES[plan] ?? PLAN_NICKNAMES[tier] ?? PLAN_NICKNAMES.free
        );
      })
      .catch(() => {});
  }, []);

  const initials = user?.fullName
    ? user?.fullName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "U";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F2EDE8" }} edges={["top"]}>
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingBottom: 36,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.backgroundOrbTop} />
      <View style={styles.backgroundOrbBottom} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={26} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerEyebrow}>
          <Ionicons name="person-circle-outline" size={16} color="#C44736" />
          <Text style={styles.headerEyebrowText}>Account summary</Text>
        </View>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Your core identity, tax status, and plan in one place.</Text>
      </View>

      {/* Profile Hero */}
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: user?.active_profile ? "#34A853" : "#9CA3AF" },
              ]}
            />
          </View>

          <View style={styles.heroInfo}>
            <Text style={styles.name} numberOfLines={1}>
              {user?.fullName || "User"}
            </Text>
            <Text style={styles.heroCaption} numberOfLines={1}>
              {user?.email || "No email address on file"}
            </Text>
            <View style={styles.heroBadges}>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: user?.active_profile ? "#ECFDF3" : "#F3F4F6" },
                ]}
              >
                <Ionicons
                  name={user?.active_profile ? "checkmark-circle" : "time-outline"}
                  size={12}
                  color={user?.active_profile ? "#34A853" : "#6B7280"}
                />
                <Text
                  style={[
                    styles.badgeText,
                    { color: user?.active_profile ? "#1F7A3D" : "#6B7280" },
                  ]}
                >
                  {user?.active_profile ? "Active profile" : "Inactive profile"}
                </Text>
              </View>

              <View style={styles.badge}>
                <Ionicons name="shield-checkmark-outline" size={12} color="#C44736" />
                <Text style={styles.badgeText}>
                  {formatCategory(user?.taxpayer_category) || "Taxpayer"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.heroStats}>
          <View style={styles.statPill}>
            <Text style={styles.statLabel}>TIN</Text>
            <Text style={styles.statValue} numberOfLines={1}>
              {user?.tin || "Not assigned"}
            </Text>
          </View>

          <View style={styles.statPill}>
            <Text style={styles.statLabel}>Region</Text>
            <Text style={styles.statValue} numberOfLines={1}>
              {user?.region || "Not set"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>Account</Text>
        <Text style={styles.sectionHint}>Tap to open the full editor</Text>
      </View>

      <TouchableOpacity
        style={styles.optionCard}
        onPress={() => router.push("/alter-profile")}
        activeOpacity={0.86}
      >
        <View style={styles.optionIconWrap}>
          <Ionicons name="create-outline" size={20} color="#C44736" />
        </View>

        <View style={styles.optionTextContainer}>
          <Text style={styles.optionTitle}>Edit Profile</Text>
          <Text style={styles.optionSubtitle}>
            Update name, phone, email, region, TIN and taxpayer category.
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
      </TouchableOpacity>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>Subscription</Text>
        <Text style={styles.sectionHint}>Current access level and feature state</Text>
      </View>

      <View style={styles.subscriptionCard}>
        <View style={styles.subscriptionHeaderRow}>
          <View>
            <Text style={styles.subscriptionTitle}>Current Plan</Text>
            <Text style={styles.subscriptionPlan}>
              # {planNickname}
            </Text>
          </View>

          <View
            style={[
              styles.planBadge,
              {
                backgroundColor: user?.active_profile ? "#ECFDF3" : "#F3F4F6",
              },
            ]}
          >
            <Text
              style={[
                styles.planText,
                { color: user?.active_profile ? "#1F7A3D" : "#6B7280" },
              ]}
            >
              {user?.active_profile ? "Active" : "Free tier"}
            </Text>
          </View>
        </View>

        <Text style={styles.subscriptionText}>
          This is the plan nickname currently associated with your account.
        </Text>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2EDE8",
    paddingHorizontal: 18,
    paddingTop: 12,
  },

  backBtn: {
    marginBottom: 12,
  },

  backgroundOrbTop: {
    position: "absolute",
    top: -28,
    right: -44,
    width: 124,
    height: 124,
    borderRadius: 62,
    backgroundColor: "rgba(196, 71, 54, 0.08)",
  },

  backgroundOrbBottom: {
    position: "absolute",
    bottom: 220,
    left: -42,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(107, 114, 128, 0.07)",
  },

  header: {
    marginBottom: 16,
    paddingRight: 4,
  },

  headerEyebrow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#FFF8F6",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F8C5BF",
  },

  headerEyebrowText: {
    marginLeft: 6,
    color: "#C44736",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },

  title: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    letterSpacing: -0.4,
  },

  subtitle: {
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "Inter_400Regular",
    marginTop: 8,
    maxWidth: 320,
  },

  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    marginBottom: 26,
    borderWidth: 1,
    borderColor: "#EFEFED",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 3,
  },

  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatarWrap: {
    marginRight: 14,
    position: "relative",
  },

  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#C44736",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#C44736",
    shadowOpacity: 0.24,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 5,
  },

  statusDot: {
    position: "absolute",
    right: 3,
    bottom: 3,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontFamily: "Inter_700Bold",
  },

  heroInfo: {
    flex: 1,
    minWidth: 0,
  },

  name: {
    fontSize: 22,
    color: "#111827",
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.2,
  },

  heroCaption: {
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "Inter_400Regular",
    marginTop: 5,
  },

  heroBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  badgeText: {
    color: "#6B7280",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },

  heroStats: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },

  statPill: {
    flex: 1,
    backgroundColor: "#F8F6F4",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#F0E7E3",
  },

  statLabel: {
    color: "#9CA3AF",
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    fontFamily: "Inter_600SemiBold",
    marginBottom: 4,
  },

  statValue: {
    color: "#111827",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },

  sectionHeader: {
    marginBottom: 10,
  },

  sectionLabel: {
    color: "#111827",
    fontSize: 17,
    marginBottom: 4,
    fontFamily: "Inter_600SemiBold",
  },

  sectionHint: {
    color: "#6B7280",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },

  optionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 26,
    borderWidth: 1,
    borderColor: "#EFEFED",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 2,
  },

  optionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF5F3",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  optionTextContainer: {
    flex: 1,
  },

  optionTitle: {
    color: "#111827",
    fontFamily: "Inter_600SemiBold",
    fontSize: 15.5,
  },

  optionSubtitle: {
    color: "#6B7280",
    fontSize: 12.5,
    lineHeight: 18,
    marginTop: 4,
    fontFamily: "Inter_400Regular",
  },

  subscriptionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#EFEFED",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 2,
  },

  subscriptionHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },

  subscriptionTitle: {
    color: "#6B7280",
    fontFamily: "Inter_500Medium",
    marginBottom: 6,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  subscriptionPlan: {
    fontSize: 26,
    color: "#111827",
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
  },

  planBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },

  planText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },

  subscriptionText: {
    color: "#6B7280",
    lineHeight: 21,
    fontFamily: "Inter_400Regular",
    marginTop: 12,
  },
});
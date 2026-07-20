import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as LocalAuthentication from "expo-local-authentication";
import React, { useEffect, useRef, useState } from "react";
import { useUser } from "@/context/UserContext";
import {
  ActivityIndicator,
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toggle from "@/components/Toggle";
import { getSubscriptionStatus } from "@/services/subscriptions.service";
import { requestDataExport } from "@/services/user.service";
import { biometricRegister } from "@/services/auth.service";
import { isBiometricEnabled, setBiometricEnabled, saveBiometricToken, getBiometricToken } from "@/utils/storage";
import { getDeviceInfo } from "@/utils/device";
import { useToast } from "@/context/ToastContext";
import { getUserFriendlyError } from "@/utils/error";

const PLAN_NICKNAMES: Record<string, string> = {
  free: "wiggly_faraday",
  monthly: "peppy_kepler",
  annual: "goofy_euler",
};

const menuItems = [
  {
    title: "Active Sessions",
    subtitle: "Manage your logged-in devices",
    icon: "phone-portrait-outline",
    route: "/active-sessions",
    color: "#3B82F6",
  },
  {
    title: "Notifications",
    subtitle: "Alerts, reminders and preferences",
    icon: "notifications-outline",
    route: "/notification-preferences",
    color: "#F59E0B",
  },
  {
    title: "Change Password",
    subtitle: "Update your login password",
    icon: "lock-closed-outline",
    route: "/change-password",
    color: "#8B5CF6",
  },
  {
    title: "Taxpayer Profile",
    subtitle: "Tax registrations and modules",
    icon: "person-circle-outline",
    route: "/taxpayer-profile",
    color: "#C44736",
  },
  {
    title: "Manage Plan",
    subtitle: "View and manage your subscription",
    icon: "swap-horizontal-outline",
    route: "/manage-plan",
    color: "#34A853",
  },
];

export default function SettingsScreen() {
  const { user } = useUser();
  const { showToast } = useToast();
  const [planNickname, setPlanNickname] = useState(PLAN_NICKNAMES.free);
  const [requestingData, setRequestingData] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricOn, setBiometricOn] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const entrance = useRef(new Animated.Value(0)).current;
  const heroAnim = useRef(new Animated.Value(0)).current;
  const securityAnim = useRef(new Animated.Value(0)).current;
  const accountAnim = useRef(new Animated.Value(0)).current;
  const privacyAnim = useRef(new Animated.Value(0)).current;
  const logoutAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    LocalAuthentication.hasHardwareAsync().then(async (has) => {
      const enrolled = has ? await LocalAuthentication.isEnrolledAsync() : false;
      setBiometricAvailable(has && enrolled);
      if (has && enrolled) {
        const enabled = await isBiometricEnabled();
        setBiometricOn(enabled);
      }
    }).catch(() => {});
  }, []);

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

    Animated.stagger(110, [
      Animated.timing(entrance, {
        toValue: 1,
        duration: 560,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(heroAnim, {
        toValue: 1,
        duration: 540,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(securityAnim, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(accountAnim, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(privacyAnim, {
        toValue: 1,
        duration: 510,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(logoutAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "U";

  const securityItems = menuItems.slice(0, 3);
  const accountItems = menuItems.slice(3);

  const handleBiometricToggle = async (value: boolean) => {
    if (biometricLoading) return;
    setBiometricLoading(true);
    try {
      if (value) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: "Confirm your identity to enable biometric login",
          cancelLabel: "Cancel",
        });
        if (!result.success) {
          showToast("Biometric authentication cancelled.", "info");
          return;
        }
        const existingToken = await getBiometricToken();
        if (existingToken) {
          await setBiometricEnabled(true);
          setBiometricOn(true);
          showToast("Biometric login enabled.", "success");
          return;
        }
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let token = "";
        for (let i = 0; i < 64; i++) token += chars.charAt(Math.floor(Math.random() * chars.length));
        await biometricRegister(token, getDeviceInfo());
        await saveBiometricToken(token);
        await setBiometricEnabled(true);
        setBiometricOn(true);
        showToast("Biometric login enabled.", "success");
      } else {
        await setBiometricEnabled(false);
        setBiometricOn(false);
        showToast("Biometric login disabled.", "info");
      }
    } catch (error: any) {
      showToast(getUserFriendlyError(error), "error");
    } finally {
      setBiometricLoading(false);
    }
  };

  const handleRequestData = async () => {
    setRequestingData(true);
    try {
      await requestDataExport();
      showToast("Data export requested. You will be notified when it is ready.", "success");
    } catch (error: any) {
      showToast(getUserFriendlyError(error), "error");
    } finally {
      setRequestingData(false);
    }
  };

  const privacyStyle = {
    opacity: privacyAnim,
    transform: [
      {
        translateY: privacyAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [18, 0],
        }),
      },
    ],
  };

  const heroStyle = {
    opacity: heroAnim,
    transform: [
      {
        translateY: heroAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [18, 0],
        }),
      },
    ],
  };

  const securityStyle = {
    opacity: securityAnim,
    transform: [
      {
        translateY: securityAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [18, 0],
        }),
      },
    ],
  };

  const accountStyle = {
    opacity: accountAnim,
    transform: [
      {
        translateY: accountAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [18, 0],
        }),
      },
    ],
  };

  const logoutStyle = {
    opacity: logoutAnim,
    transform: [
      {
        translateY: logoutAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [14, 0],
        }),
      },
    ],
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 60 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.backgroundOrbTop} />
      <View style={styles.backgroundOrbBottom} />

      {/* Header */}
      <Animated.View style={[styles.header, { opacity: entrance }]}> 
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.8}>
          <Ionicons name="chevron-back" size={20} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerTextBlock}>
          <View style={styles.headerEyebrow}>
            <Ionicons name="options-outline" size={14} color="#C44736" />
            <Text style={styles.headerEyebrowText}>Account controls</Text>
          </View>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>
            Fine-tune your account, sessions, alerts, and plan.
          </Text>
        </View>
      </Animated.View>

      {/* Profile Card */}
      <Animated.View style={[styles.heroWrap, heroStyle]}>
      <TouchableOpacity
        style={styles.profileCard}
        onPress={() => router.push("/alter-profile")}
        activeOpacity={0.9}
      >
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

        <View style={styles.profileInfo}>
          <Text style={styles.profileName} numberOfLines={1}>
            {user?.fullName ?? "TaxPadi User"}
          </Text>
          <Text style={styles.profileMeta} numberOfLines={1}>
            {user?.email || "No email address on file"}
          </Text>
          <View style={styles.nicknamePill}>
            <Ionicons name="sparkles-outline" size={11} color="#C44736" />
            <Text style={styles.nicknameText}># {planNickname}</Text>
          </View>
          <Text style={styles.profileTin}>
            {user?.tin?.trim() ? `TIN · ${user.tin}` : "TIN not assigned"}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
      </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[styles.metricsRow, heroStyle]}>
        <View style={styles.metricCard}>
          <Ionicons name="person-outline" size={16} color="#6B7280" />
          <Text style={styles.metricValue} numberOfLines={1}>
            {user?.taxpayer_category || "Taxpayer"}
          </Text>
          <Text style={styles.metricLabel}>Category</Text>
        </View>

        <View style={styles.metricCard}>
          <Ionicons name="location-outline" size={16} color="#6B7280" />
          <Text style={styles.metricValue} numberOfLines={1}>
            {user?.region || "Not set"}
          </Text>
          <Text style={styles.metricLabel}>Region</Text>
        </View>
      </Animated.View>

      <Animated.View style={[styles.sectionBlock, securityStyle]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Security</Text>
          <Text style={styles.sectionHint}>Devices and alerts</Text>
        </View>
        <View style={styles.menuGroupCard}>
          {securityItems.map((item, index) => (
            <TouchableOpacity
              key={item.title}
              style={[styles.menuItem, styles.menuItemBorder]}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.86}
            >
              <View style={[styles.iconContainer, { backgroundColor: "#F3F4F6" }]}>
                <Ionicons name={item.icon as any} size={18} color="#6B7280" />
              </View>

              <View style={styles.textContainer}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>

              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
          <View style={styles.menuItem}>
            <View style={[styles.iconContainer, { backgroundColor: "#F3F4F6" }]}>
              <Ionicons name="finger-print" size={18} color={biometricAvailable ? "#6B7280" : "#D1D5DB"} />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.menuTitle, !biometricAvailable && { color: "#9CA3AF" }]}>
                Biometric Login
              </Text>
              <Text style={styles.menuSubtitle}>
                {biometricAvailable
                  ? "Use Face ID or fingerprint to sign in"
                  : "Enable Face ID or fingerprint in device Settings first"}
              </Text>
            </View>
            {biometricLoading ? (
              <ActivityIndicator size="small" color="#9CA3AF" />
            ) : (
              <Toggle
                value={biometricOn}
                onValueChange={() => handleBiometricToggle(!biometricOn)}
                disabled={!biometricAvailable}
              />
            )}
          </View>
        </View>
      </Animated.View>

      <Animated.View style={[styles.sectionBlock, accountStyle]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Text style={styles.sectionHint}>Profile and plan management</Text>
        </View>
        <View style={styles.menuGroupCard}>
          {accountItems.map((item, index) => (
            <TouchableOpacity
              key={item.title}
              style={[styles.menuItem, index < accountItems.length - 1 && styles.menuItemBorder]}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.86}
            >
              <View style={[styles.iconContainer, { backgroundColor: "#F3F4F6" }]}>
                <Ionicons name={item.icon as any} size={18} color="#6B7280" />
              </View>

              <View style={styles.textContainer}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>

              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {/* Privacy & Data */}
      <Animated.View style={[styles.sectionBlock, privacyStyle]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Privacy & Data</Text>
          <Text style={styles.sectionHint}>Your data rights and account</Text>
        </View>
        <View style={styles.menuGroupCard}>
          {/* Health Score */}
          <TouchableOpacity
            style={[styles.menuItem, styles.menuItemBorder]}
            onPress={() => router.push("/health-score")}
            activeOpacity={0.86}
          >
            <View style={[styles.iconContainer, { backgroundColor: "#F3F4F6" }]}>
              <Ionicons name="pulse-outline" size={18} color="#6B7280" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.menuTitle}>Financial Health Score</Text>
              <Text style={styles.menuSubtitle}>See your overall tax & financial health</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Request My Data */}
          <TouchableOpacity
            style={[styles.menuItem, styles.menuItemBorder]}
            onPress={handleRequestData}
            disabled={requestingData}
            activeOpacity={0.86}
          >
            <View style={[styles.iconContainer, { backgroundColor: "#F3F4F6" }]}>
              <Ionicons name="download-outline" size={18} color="#6B7280" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.menuTitle}>Request My Data</Text>
              <Text style={styles.menuSubtitle}>
                {requestingData ? "Submitting request…" : "Export a copy of your account data"}
              </Text>
            </View>
            {requestingData ? (
              <Ionicons name="hourglass-outline" size={18} color="#9CA3AF" />
            ) : (
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            )}
          </TouchableOpacity>

          {/* Deactivate Account */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/deactivate-account")}
            activeOpacity={0.86}
          >
            <View style={[styles.iconContainer, { backgroundColor: "#F3F4F6" }]}>
              <Ionicons name="trash-outline" size={18} color="#6B7280" />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.menuTitle, { color: "#DC2626" }]}>Deactivate Account</Text>
              <Text style={styles.menuSubtitle}>Permanently deactivate your account</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Logout */}
      <Animated.View style={logoutStyle}>
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => router.push("/logout-confirmation")}
        activeOpacity={0.86}
      >
        <Ionicons name="log-out-outline" size={22} color="#C44736" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
      </Animated.View>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F2EDE8",
  },

  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  backgroundOrbTop: {
    position: "absolute",
    top: -28,
    right: -42,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: "rgba(196, 71, 54, 0.08)",
  },

  backgroundOrbBottom: {
    position: "absolute",
    left: -38,
    top: 430,
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: "rgba(107, 114, 128, 0.07)",
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 18,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#EFEFED",
  },

  headerTextBlock: {
    flex: 1,
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
    fontSize: 31,
    color: "#111827",
    fontFamily: "Inter_700Bold",
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

  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EFEFED",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },

  heroWrap: {
    marginBottom: 10,
  },

  avatarWrap: {
    position: "relative",
    marginRight: 14,
  },

  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#C44736",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#C44736",
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },

  statusDot: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  avatarText: {
    color: "#FFFFFF",
    fontFamily: "Inter_700Bold",
    fontSize: 20,
  },

  profileInfo: {
    flex: 1,
  },

  profileName: {
    color: "#111827",
    fontFamily: "Inter_700Bold",
    fontSize: 17,
    letterSpacing: -0.2,
  },

  profileMeta: {
    color: "#6B7280",
    fontFamily: "Inter_400Regular",
    fontSize: 12.5,
    marginTop: 4,
  },

  nicknamePill: {
    backgroundColor: "#F3F4F6",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: "flex-start",
    marginTop: 7,
    marginBottom: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  nicknameText: {
    color: "#6B7280",
    fontFamily: "Inter_400Regular",
    fontSize: 11.5,
    letterSpacing: 0.2,
  },

  profileTin: {
    color: "#9CA3AF",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },

  metricsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },

  metricCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#EFEFED",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  metricValue: {
    color: "#111827",
    fontFamily: "Inter_700Bold",
    fontSize: 14.5,
    marginTop: 10,
  },

  metricLabel: {
    color: "#6B7280",
    fontFamily: "Inter_500Medium",
    fontSize: 11.5,
    marginTop: 3,
  },

  sectionBlock: {
    marginTop: 14,
  },

  sectionHeader: {
    marginBottom: 10,
  },

  sectionTitle: {
    color: "#111827",
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },

  sectionHint: {
    color: "#6B7280",
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 4,
  },

  menuGroupCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EFEFED",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 14,
  },

  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },

  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  textContainer: {
    flex: 1,
  },

  menuTitle: {
    fontFamily: "Inter_600SemiBold",
    color: "#111827",
    fontSize: 15.5,
  },

  menuSubtitle: {
    color: "#6B7280",
    fontSize: 12.5,
    marginTop: 3,
    fontFamily: "Inter_400Regular",
  },

  logoutButton: {
    backgroundColor: "#FFF5F3",
    borderRadius: 18,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#F8C5BF",
  },

  logoutText: {
    color: "#C44736",
    marginLeft: 8,
    fontFamily: "Inter_600SemiBold",
    fontSize: 15.5,
  },
});

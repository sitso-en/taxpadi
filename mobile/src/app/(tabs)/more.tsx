import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useUser } from "../../context/UserContext";
import { useDeadlines } from "../../context/DeadlineContext";
import { useSavings } from "../../context/SavingsContext";
import { useReferrals } from "../../context/ReferralContext";
import { useCertificates } from "../../context/CertificateContext";
import { getSubscriptionStatus } from "../../services/subscriptions.service";

const PLAN_NICKNAMES: Record<string, string> = {
  free: "wiggly_faraday",
  monthly: "peppy_kepler",
  annual: "goofy_euler",
};

export default function MoreScreen() {
  const { user } = useUser();
  const { deadlines } = useDeadlines();
  const { totalSaved } = useSavings();
  const { availableOffers } = useReferrals();
  const { validCertificates } = useCertificates();

  const [planNickname, setPlanNickname] = useState<string>(PLAN_NICKNAMES.free);

  useEffect(() => {
    getSubscriptionStatus()
      .then((res) => {
        const data = res.data ?? res;
        const tier = data.subscription_tier ?? "free";
        const plan = data.plan ?? (tier === "paid" ? "monthly" : "free");
        setPlanNickname(PLAN_NICKNAMES[plan] ?? PLAN_NICKNAMES[tier] ?? PLAN_NICKNAMES.free);
      })
      .catch(() => { });
  }, []);

  // Count future deadlines only
  const upcomingDeadlines = deadlines.filter(
    (deadline) => new Date(deadline.dueDate) >= new Date()
  ).length;

  // User initials
  const initials = user?.fullName
    ? user.fullName
      .split(" ")
      .map((name: string) => name[0])
      .join("")
      .substring(0, 2)
      .toUpperCase()
    : "U";

  const menuItems = [
    {
      title: "Savings Vault",
      subtitle:
        totalSaved === 0
          ? "No savings yet"
          : `GH¢ ${totalSaved.toFixed(2)} saved`,
      icon: "wallet-outline",
      route: "/savings-vault",
      color: "#34A853",
    },
    {
      title: "Deadlines & Penalties",
      subtitle:
        upcomingDeadlines === 0
          ? "No upcoming deadlines"
          : `${upcomingDeadlines} upcoming deadline${upcomingDeadlines > 1 ? "s" : ""
          }`,
      icon: "calendar-outline",
      route: "/deadlines",
      color: "#EA4335",
    },
    {
      title: "Compliance Certificate",
      subtitle:
        validCertificates === 0
          ? "No certificates available"
          : `${validCertificates} certificate${validCertificates > 1 ? "s" : ""
          } available`,
      icon: "shield-checkmark-outline",
      route: "/compliance-certificate",
      color: "#F4B400",
    },
    {
      title: "Invoices",
      subtitle: "Create and manage invoices",
      icon: "receipt-outline",
      route: "/invoices",
      color: "#C44736",
    },
    {
      title: "Insurance + Loan Referrals",
      subtitle:
        availableOffers === 0
          ? "No available offers"
          : `${availableOffers} available offer${availableOffers > 1 ? "s" : ""
          }`,
      icon: "gift-outline",
      route: "/referral-offers",
      color: "#FF6F00",
    },
    {
      title: "PAYE",
      subtitle: "Pay As You Earn management",
      icon: "cash-outline",
      route: "/paye",
      color: "#3B82F6",
    },
    {
      title: "VAT",
      subtitle: "Value Added Tax records",
      icon: "calculator-outline",
      route: "/vat",
      color: "#8B5CF6",
    },
    {
      title: "Withholding Tax",
      subtitle: "WHT records and rates",
      icon: "document-text-outline",
      route: "/withholding-tax",
      color: "#F59E0B",
    },
    {
      title: "Reports & Export",
      subtitle: "Download as PDF or CSV",
      icon: "bar-chart-outline",
      route: "/reports",
      color: "#34A853",
    },
    {
      title: "Tax Returns",
      subtitle: "File and manage your tax returns",
      icon: "document-attach-outline",
      route: "/tax-returns",
      color: "#EA4335",
    },
    {
      title: "Settings",
      subtitle: "Profile, plan and preferences",
      icon: "settings-outline",
      route: "/settings",
      color: "#6B7280",
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: 80,
      }}
    >
      <View style={styles.backgroundOrbTop} />
      <View style={styles.backgroundOrbBottom} />

      <View style={styles.header}>
        <View style={styles.headerEyebrow}>
          <Ionicons name="apps-outline" size={16} color="#C44736" />
          <Text style={styles.headerEyebrowText}>Overview</Text>
        </View>
        <Text style={styles.title}>More</Text>
        <Text style={styles.subtitle}>
          Access to your tax tools, profile, and account controls.
        </Text>
      </View>

      {/* Profile Hero */}
      <TouchableOpacity
        style={styles.profileCard}
        onPress={() => router.push("/edit-profile")}
        activeOpacity={0.88}
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
          <View style={styles.profileBadges}>
            <View style={styles.nicknamePill}>
              <Text style={styles.nicknameText}># {planNickname}</Text>
            </View>
            <View style={styles.statePill}>
              <Text style={styles.statePillText}>
                {user?.active_profile ? "Active profile" : "Inactive profile"}
              </Text>
            </View>
          </View>
          <Text style={styles.profileTin}>
            {user?.tin?.trim() ? `TIN · ${user.tin}` : "TIN not assigned"}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
      </TouchableOpacity>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="wallet-outline" size={18} color="#6B7280" />
          <Text style={styles.statValue}>{totalSaved === 0 ? "GH¢ 0" : `GH¢ ${totalSaved.toFixed(2)}`}</Text>
          <Text style={styles.statLabel}>Saved</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="calendar-outline" size={18} color="#6B7280" />
          <Text style={styles.statValue}>{upcomingDeadlines}</Text>
          <Text style={styles.statLabel}>Deadlines</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="gift-outline" size={18} color="#6B7280" />
          <Text style={styles.statValue}>{availableOffers}</Text>
          <Text style={styles.statLabel}>Offers</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="shield-checkmark-outline" size={18} color="#6B7280" />
          <Text style={styles.statValue}>{validCertificates}</Text>
          <Text style={styles.statLabel}>Certificates</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Core Tools</Text>
        <Text style={styles.sectionHint}>Most-used tax workflows</Text>
      </View>

      <View style={styles.menuGroupCard}>
        {menuItems.slice(0, 10).map((item, index) => (
          <TouchableOpacity
            key={item.title}
            style={[
              styles.menuItem,
              index !== 9 && styles.menuItemBorder,
            ]}
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

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Account</Text>

      </View>

      <View style={styles.menuGroupCard}>
        {menuItems.slice(10).map((item) => (
          <TouchableOpacity
            key={item.title}
            style={styles.menuItem}
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

      {/* Legal & Support */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Legal & Support</Text>
        <Text style={styles.sectionHint}>Policies, terms, and help</Text>
      </View>

      <View style={styles.menuGroupCard}>
        {[
          {
            title: "Privacy Policy",
            subtitle: "How we collect and protect your data",
            icon: "shield-outline",
            route: "/privacy-policy",
            color: "#6B7280",
          },
          {
            title: "Terms & Conditions",
            subtitle: "Your rights and our responsibilities",
            icon: "document-text-outline",
            route: "/terms-conditions",
            color: "#6B7280",
          },
          {
            title: "Contact Support",
            subtitle: "Get help from the TaxPadi team",
            icon: "chatbubble-ellipses-outline",
            route: "/contact-support",
            color: "#C44736",
          },
        ].map((item, index, arr) => (
          <TouchableOpacity
            key={item.title}
            style={[styles.menuItem, index !== arr.length - 1 && styles.menuItemBorder]}
            onPress={() => router.push(item.route as any)}
            activeOpacity={0.86}
          >
            <View style={[styles.iconContainer, { backgroundColor: item.color + "18" }]}>
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

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => router.push("/logout-confirmation")}
        activeOpacity={0.86}
      >
        <Ionicons name="log-out-outline" size={22} color="#C44736" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
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

  backgroundOrbTop: {
    position: "absolute",
    top: -30,
    right: -42,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: "rgba(196, 71, 54, 0.08)",
  },

  backgroundOrbBottom: {
    position: "absolute",
    left: -40,
    bottom: 220,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(107, 114, 128, 0.07)",
  },

  header: {
    marginBottom: 12,
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
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    letterSpacing: -0.3,
  },

  subtitle: {
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "Inter_400Regular",
    marginTop: 6,
    maxWidth: 320,
  },

  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EFEFED",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },

  avatarWrap: {
    marginRight: 14,
    position: "relative",
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
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
    fontSize: 18,
  },

  profileInfo: {
    flex: 1,
  },

  profileName: {
    color: "#111827",
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    letterSpacing: -0.2,
  },

  profileMeta: {
    color: "#6B7280",
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 4,
  },

  profileBadges: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    marginTop: 8,
    marginBottom: 6,
  },

  nicknamePill: {
    backgroundColor: "#F3F4F6",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
    alignSelf: "flex-start",
  },

  nicknameText: {
    color: "#6B7280",
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    letterSpacing: 0.2,
  },

  statePill: {
    backgroundColor: "#ECFDF3",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
    alignSelf: "flex-start",
  },

  statePillText: {
    color: "#1F7A3D",
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
  },

  profileTin: {
    color: "#9CA3AF",
    fontSize: 11.5,
    fontFamily: "Inter_400Regular",
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 4,
  },

  statCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: "#EFEFED",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  statValue: {
    color: "#111827",
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    marginTop: 6,
  },

  statLabel: {
    color: "#6B7280",
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    marginTop: 2,
  },

  sectionHeader: {
    marginTop: 10,
    marginBottom: 6,
  },

  sectionTitle: {
    color: "#111827",
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },

  sectionHint: {
    color: "#6B7280",
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    marginTop: 2,
  },

  menuGroupCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
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
    paddingVertical: 11,
    paddingHorizontal: 12,
  },

  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },

  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  textContainer: {
    flex: 1,
  },

  menuTitle: {
    fontFamily: "Inter_600SemiBold",
    color: "#111827",
    fontSize: 14,
  },

  menuSubtitle: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 2,
    fontFamily: "Inter_400Regular",
  },

  logoutButton: {
    backgroundColor: "#FFF5F3",
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: "#F8C5BF",
  },

  logoutText: {
    color: "#C44736",
    marginLeft: 8,
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
});
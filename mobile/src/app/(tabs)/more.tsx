import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useUser } from "../../context/UserContext";
import { useNotifications } from "../../context/NotificationContext";
import { useDeadlines } from "../../context/DeadlineContext";
import { useSavings } from "../../context/SavingsContext";
import { useReferrals } from "../../context/ReferralContext";
import { useCertificates } from "../../context/CertificateContext";

export default function MoreScreen() {
  const { user } = useUser();
  const { unreadCount } = useNotifications();
  const { deadlines } = useDeadlines();
  const { totalSaved } = useSavings();
  const { availableOffers } = useReferrals();
  const { validCertificates } = useCertificates();

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
          : `${upcomingDeadlines} upcoming deadline${
              upcomingDeadlines > 1 ? "s" : ""
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
          : `${validCertificates} certificate${
              validCertificates > 1 ? "s" : ""
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
      title: "Reports & Export",
      subtitle: "Download as PDF or CSV",
      icon: "bar-chart-outline",
      route: "/reports",
      color: "#34A853",
    },
    {
      title: "Referral Offers",
      subtitle:
        availableOffers === 0
          ? "No available offers"
          : `${availableOffers} available offer${
              availableOffers > 1 ? "s" : ""
            }`,
      icon: "gift-outline",
      route: "/referral-offers",
      color: "#FF6F00",
    },
    {
      title: "Notifications",
      subtitle:
        unreadCount === 0
          ? "No unread notifications"
          : `${unreadCount} unread notification${
              unreadCount > 1 ? "s" : ""
            }`,
      icon: "notifications-outline",
      route: "/notification-preferences",
      color: "#F4B400",
    },
    {
      title: "Profile & Settings",
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
        paddingBottom: 120,
      }}
    >
      <Text style={styles.title}>More</Text>

      {/* Profile Card */}
      <TouchableOpacity
        style={styles.profileCard}
        onPress={() => router.push("/settings")}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.profileName}>{user?.label ?? "Default Profile"}</Text>
          <Text style={styles.profilePhone}>
            TIN: {user?.tin ?? "Not Available"}
          </Text>
          <Text style={styles.profileEmail}>
            {user?.taxpayer_category ?? "Taxpayer"}
          </Text>
        </View>

        <View
          style={[
            styles.proBadge,
            { backgroundColor: user?.active_profile ? "#F4B400" : "#FFFFFF" },
          ]}
        >
          <Text
            style={[
              styles.proText,
              { color: user?.active_profile ? "#FFFFFF" : "#C44736" },
            ]}
          >
            {user?.active_profile ? "ACTIVE" : "INACTIVE"}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Menu Items */}
      {menuItems.map((item) => (
        <TouchableOpacity
          key={item.title}
          style={styles.menuItem}
          onPress={() => router.push(item.route as any)}
        >
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: item.color + "20" },
            ]}
          >
            <Ionicons name={item.icon as any} size={18} color={item.color} />
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.menuTitle}>{item.title}</Text>
            <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
          </View>

          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      ))}

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => router.push("/logout-confirmation")}
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
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 16,
    paddingTop: 44,
  },

  title: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    marginBottom: 20,
  },

  profileCard: {
    backgroundColor: "#C44736",
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  avatarText: {
    color: "#C44736",
    fontFamily: "Inter_700Bold",
    fontSize: 18,
  },

  profileName: {
    color: "#FFFFFF",
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },

  profilePhone: {
    color: "#FDECEC",
    marginTop: 4,
    fontFamily: "Inter_400Regular",
    fontSize: 13,
  },

  profileEmail: {
    color: "#FDECEC",
    marginTop: 2,
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },

  proBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  proText: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ECECEC",
  },

  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  textContainer: {
    flex: 1,
  },

  menuTitle: {
    fontFamily: "Inter_600SemiBold",
    color: "#111827",
    fontSize: 15,
  },

  menuSubtitle: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 2,
    fontFamily: "Inter_400Regular",
  },

  logoutButton: {
    backgroundColor: "#FFF5F3",
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 30,
  },

  logoutText: {
    color: "#C44736",
    marginLeft: 8,
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
  },
});
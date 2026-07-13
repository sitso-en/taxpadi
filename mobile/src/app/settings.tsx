import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { useUser } from "@/context/UserContext";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SettingsScreen() {
  const { user } = useUser();

  const initials = user?.label
    ? user.label
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "U";

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.push("/more")}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#C44736" />
        </TouchableOpacity>

        {/* Screen Title & Subtitle */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>
            Manage your account, preferences and subscription.
          </Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>

            <View>
              <Text style={styles.name}>
                {user?.label || "Default Profile"}
              </Text>
              <Text style={styles.phone}>
                TIN: {user?.tin || "Not Available"}
              </Text>
              <Text style={styles.email}>
                {user?.taxpayer_category || "Taxpayer"}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.proBadge,
              {
                backgroundColor: user?.active_profile ? "#34A853" : "#6B7280",
              },
            ]}
          >
            <Text style={styles.proText}>
              {user?.active_profile ? "ACTIVE" : "INACTIVE"}
            </Text>
          </View>
        </View>

        {/* ACCOUNT */}
        <Text style={styles.sectionTitle}>ACCOUNT</Text>

        <TouchableOpacity
          style={styles.item}
          onPress={() => router.push("/alter-profile")}
        >
          <View style={styles.row}>
            <Ionicons name="person-outline" size={22} color="#222" />
            <Text style={styles.itemText}>Edit Profile</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.item}
          onPress={() => router.push("/active-sessions")}
        >
          <View style={styles.row}>
            <Ionicons name="phone-portrait-outline" size={22} color="#222" />
            <Text style={styles.itemText}>Active Sessions</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        {/* PREFERENCES */}
        <Text style={styles.sectionTitle}>PREFERENCES</Text>

        <TouchableOpacity
          style={styles.item}
          onPress={() => router.push("/notification-preferences")}
        >
          <View style={styles.row}>
            <Ionicons name="notifications-outline" size={22} color="#222" />
            <Text style={styles.itemText}>Notifications</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        {/* TAX MODULES */}
        <Text style={styles.sectionTitle}>TAX MODULES</Text>

        <TouchableOpacity
          style={styles.item}
          onPress={() => router.push("/taxpayer-profile")}
        >
          <View style={styles.row}>
            <Ionicons
              name="person-circle-outline"
              size={22}
              color="#222"
            />
            <Text style={styles.itemText}>
              Taxpayer Profile
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color="#999"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.item}
          onPress={() => router.push("/paye")}
        >
          <View style={styles.row}>
            <Ionicons
              name="cash-outline"
              size={22}
              color="#222"
            />
            <Text style={styles.itemText}>
              PAYE
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color="#999"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.item}
          onPress={() => router.push("/vat")}
        >
          <View style={styles.row}>
            <Ionicons
              name="calculator-outline"
              size={22}
              color="#222"
            />
            <Text style={styles.itemText}>
              VAT
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color="#999"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.item}
          onPress={() => router.push("/withholding-tax")}
        >
          <View style={styles.row}>
            <Ionicons
              name="document-text-outline"
              size={22}
              color="#222"
            />
            <Text style={styles.itemText}>
              Withholding Tax
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color="#999"
          />
        </TouchableOpacity>

        {/* SUBSCRIPTION */}
        <Text style={styles.sectionTitle}>SUBSCRIPTION</Text>

        <TouchableOpacity
          style={styles.item}
          onPress={() => router.push("/current-plan")}
        >
          <View style={styles.row}>
            <Ionicons name="card-outline" size={22} color="#222" />
            <Text style={styles.itemText}>Current Plan</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.item}
          onPress={() => router.push("/manage-plan")}
        >
          <View style={styles.row}>
            <Ionicons name="swap-horizontal-outline" size={22} color="#222" />
            <Text style={styles.itemText}>Manage Plan</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        {/* LOGOUT */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => router.push("/logout-confirmation")}
        >
          <Ionicons name="log-out-outline" size={22} color="#C44736" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 20,
    paddingTop: 55,
  },
  backButton: {
    marginBottom: 15,
  },
  header: {
    marginBottom: 28,
  },
  title: {
    fontSize: 32,
    color: "#111827",
    fontFamily: "Inter_700Bold",
  },
  subtitle: {
    color: "#6B7280",
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
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
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: "#C44736",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontFamily: "Inter_700Bold",
  },
  name: {
    fontSize: 18,
    color: "#111827",
    fontFamily: "Inter_700Bold",
  },
  phone: {
    color: "#6B7280",
    marginTop: 4,
    fontFamily: "Inter_400Regular",
  },
  email: {
    color: "#6B7280",
    marginTop: 4,
    fontFamily: "Inter_400Regular",
  },
  proBadge: {
    backgroundColor: "#C44736",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  proText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  sectionTitle: {
    color: "#C44736",
    fontSize: 11,
    marginBottom: 10,
    fontFamily: "Inter_600SemiBold",
  },
  item: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemText: {
    marginLeft: 14,
    color: "#111827",
    fontSize: 16,
    fontFamily: "Inter_500Medium",
  },
  logoutButton: {
    backgroundColor: "#FCE8E6",
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
  },
  logoutText: {
    color: "#C44736",
    marginLeft: 8,
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { useUser } from "../context/UserContext";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SettingsScreen() {
  const { user } = useUser();

  const initials = user.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
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
          <Ionicons
            name="arrow-back"
            size={24}
            color="#C44736"
          />
        </TouchableOpacity>

        {/* Screen Title */}
        <Text style={styles.title}>Profile</Text>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {initials}
              </Text>
            </View>

            <View>
              <Text style={styles.name}>
                {user.fullName || "User"}
              </Text>
              <Text style={styles.phone}>
                {user.phoneNumber || "+233 XX XXX XXXX"}
              </Text>
              <Text style={styles.email}>
                {user.email || "No email"}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.proBadge,
              {
                backgroundColor:
                  user.plan === "PRO"
                    ? "#C44736"
                    : "#6B7280",
              },
            ]}
          >
            <Text style={styles.proText}>
              {user.plan}
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
            <Ionicons
              name="person-outline"
              size={22}
              color="#222"
            />
            <Text style={styles.itemText}>
              Edit Profile
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
          onPress={() => router.push("/active-sessions")}
        >
          <View style={styles.row}>
            <Ionicons
              name="phone-portrait-outline"
              size={22}
              color="#222"
            />
            <Text style={styles.itemText}>
              Active Sessions
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color="#999"
          />
        </TouchableOpacity>

        {/* PREFERENCES */}
        <Text style={styles.sectionTitle}>
          PREFERENCES
        </Text>

        <TouchableOpacity
          style={styles.item}
          onPress={() =>
            router.push("/notification-preferences")
          }
        >
          <View style={styles.row}>
            <Ionicons
              name="notifications-outline"
              size={22}
              color="#222"
            />
            <Text style={styles.itemText}>
              Notifications
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color="#999"
          />
        </TouchableOpacity>

        {/* SUBSCRIPTION */}
        <Text style={styles.sectionTitle}>
          SUBSCRIPTION
        </Text>

        <TouchableOpacity
          style={styles.item}
          onPress={() => router.push("/subscription")}
        >
          <View style={styles.row}>
            <Ionicons
              name="card-outline"
              size={22}
              color="#222"
            />
            <Text style={styles.itemText}>
              Current Plan
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color="#999"
          />
        </TouchableOpacity>

        {/* LOGOUT */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() =>
            router.push("/logout-confirmation")
          }
        >
          <Ionicons
            name="log-out-outline"
            size={22}
            color="#C44736"
          />
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
  title: {
    fontSize: 32,
    color: "#111827",
    fontFamily: "Inter_700Bold",
    marginBottom: 24,
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
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
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useUser } from "../context/UserContext";

import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function TaxProfileScreen() {
  const { user } = useUser();

  const initials = user?.fullName
    ? user?.fullName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "U";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingBottom: 40,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>
          Manage your account and subscription.
        </Text>
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        <Text style={styles.name}>{user?.fullName || "User"}</Text>

        <Text style={styles.infoText}>
          {user?.tin || "No TIN available"}
        </Text>

        <Text style={styles.infoText}>
          {user?.taxpayer_category || "Taxpayer"}
        </Text>

        <View
          style={[
            styles.planBadge,
            {
              backgroundColor: user?.active_profile ? "#C44736" : "#6B7280",
            },
          ]}
        >
          <Text style={styles.planText}>{user?.active_profile ? "Active" : "Inactive"}</Text>
        </View>
      </View>

      {/* Account Section */}
      <Text style={styles.sectionLabel}>ACCOUNT</Text>

      <TouchableOpacity
        style={styles.optionCard}
        onPress={() => router.push("/alter-profile")}
      >
        <Ionicons name="create-outline" size={22} color="#C44736" />

        <View style={styles.optionTextContainer}>
          <Text style={styles.optionTitle}>Edit Profile</Text>
          <Text style={styles.optionSubtitle}>
            Update name, email, region and business details
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      {/* Subscription Section */}
      <Text style={styles.sectionLabel}>SUBSCRIPTION</Text>

      <View style={styles.subscriptionCard}>
        <Text style={styles.subscriptionTitle}>Current Plan</Text>
        <Text style={styles.subscriptionPlan}>
          {user?.active_profile ? "Pro" : "Free"}
        </Text>
        <Text style={styles.subscriptionText}>
          {user?.active_profile
            ? "You currently have access to premium features."
            : "Upgrade to PRO to unlock advanced tax tools."}
        </Text>
      </View>
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
    marginBottom: 18,
  },

  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: "#111827",
  },

  subtitle: {
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },

  profileSection: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginBottom: 30,
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

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#C44736",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
    shadowColor: "#C44736",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 5,
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },

  name: {
    fontSize: 20,
    color: "#111827",
    fontFamily: "Inter_700Bold",
    marginBottom: 10,
    textAlign: "center",
  },

  infoText: {
    color: "#6B7280",
    fontFamily: "Inter_400Regular",
    marginBottom: 6,
    textAlign: "center",
  },

  planBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 14,
  },

  planText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },

  sectionLabel: {
    color: "#C44736",
    fontSize: 16,
    marginBottom: 10,
    fontFamily: "Inter_600SemiBold",
  },

  optionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
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

  optionTextContainer: {
    flex: 1,
    marginLeft: 12,
  },

  optionTitle: {
    color: "#111827",
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },

  optionSubtitle: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 2,
    fontFamily: "Inter_400Regular",
  },

  subscriptionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
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

  subscriptionTitle: {
    color: "#6B7280",
    fontFamily: "Inter_500Medium",
    marginBottom: 8,
  },

  subscriptionPlan: {
    fontSize: 24,
    color: "#111827",
    fontFamily: "Inter_700Bold",
    marginBottom: 8,
  },

  subscriptionText: {
    color: "#6B7280",
    lineHeight: 20,
    fontFamily: "Inter_400Regular",
  },
});
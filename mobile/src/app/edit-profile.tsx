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

  const initials = user.fullName
    ? user.fullName
        .split(" ")
        .map((name) => name[0])
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

      <Text style={styles.title}>
        Profile
      </Text>

      {/* Profile Section */}

      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {initials}
          </Text>
        </View>

        <Text style={styles.name}>
          {user.fullName || "User"}
        </Text>

        <Text style={styles.infoText}>
          {user.phoneNumber ||
            "No phone number added"}
        </Text>

        <Text style={styles.infoText}>
          {user.email ||
            "No email address added"}
        </Text>

        <Text style={styles.infoText}>
          {user.region ||
            "No region selected"}
        </Text>

        <Text style={styles.infoText}>
          {user.category ||
            "No business category"}
        </Text>

        <View
          style={[
            styles.planBadge,
            {
              backgroundColor:
                user.plan === "PRO"
                  ? "#C44736"
                  : "#6B7280",
            },
          ]}
        >
          <Text style={styles.planText}>
            ★ {user.plan}
          </Text>
        </View>
      </View>

      {/* Account Section */}

      <Text style={styles.sectionLabel}>
        ACCOUNT
      </Text>

      <TouchableOpacity
        style={styles.optionCard}
        onPress={() =>
          router.push("/settings")
        }
      >
        <Ionicons
          name="create-outline"
          size={22}
          color="#C44736"
        />

        <View
          style={
            styles.optionTextContainer
          }
        >
          <Text style={styles.optionTitle}>
            Edit Profile
          </Text>

          <Text
            style={
              styles.optionSubtitle
            }
          >
            Update name, email,
            region and business
            details
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={20}
          color="#9CA3AF"
        />
      </TouchableOpacity>

      {/* Subscription Section */}

      <Text style={styles.sectionLabel}>
        SUBSCRIPTION
      </Text>

      <View style={styles.subscriptionCard}>
        <Text
          style={
            styles.subscriptionTitle
          }
        >
          Current Plan
        </Text>

        <Text
          style={
            styles.subscriptionPlan
          }
        >
          {user.plan}
        </Text>

        <Text
          style={
            styles.subscriptionText
          }
        >
          {user.plan === "PRO"
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
    paddingHorizontal: 20,
    paddingTop: 55,
  },

  title: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    marginBottom: 24,
  },

  profileSection: {
    alignItems: "center",
    marginBottom: 30,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 20,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#C44736",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 32,
    fontFamily: "Inter_700Bold",
  },

  name: {
    fontSize: 24,
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
    fontSize: 11,
    marginBottom: 10,
    fontFamily: "Inter_600SemiBold",
  },

  optionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
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
    padding: 20,
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
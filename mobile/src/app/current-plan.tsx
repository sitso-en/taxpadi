import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useUser } from "../context/UserContext";

export default function CurrentPlanScreen() {
  const { user } = useUser();

  const plan = user?.subscription_tier ?? "FREE";
  const isActive = user?.is_active ?? false;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons
          name="chevron-back"
          size={26}
          color="#111827"
        />
      </TouchableOpacity>

      <Text style={styles.title}>
        Current Plan
      </Text>

      <Text style={styles.subtitle}>
        Your active TaxPadi subscription.
      </Text>

      <View style={styles.card}>
        <View style={styles.icon}>
          <Ionicons
            name="diamond-outline"
            size={28}
            color="#FFFFFF"
          />
        </View>

        <Text style={styles.plan}>
          {plan.charAt(0).toUpperCase() + plan.slice(1).toLowerCase()}
        </Text>

        <Text style={styles.status}>
          {isActive ? "Active Subscription" : "Free Subscription"}
        </Text>
      </View>

      <Text style={styles.section}>
        INCLUDED FEATURES
      </Text>

      {[
        "Unlimited Transactions",
        "Invoice Management",
        "Reports & Export",
        "Tax Return Filing",
        "Compliance Certificate",
        "Priority Support",
      ].map((item) => (
        <View key={item} style={styles.feature}>
          <Ionicons
            name="checkmark-circle"
            size={22}
            color="#34A853"
          />

          <Text style={styles.featureText}>
            {item}
          </Text>
        </View>
      ))}

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>
          Billing Status
        </Text>

        <Text style={styles.infoValue}>
          {isActive ? "Active" : "Free"}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          router.push("/manage-plan")
        }
      >
        <Text style={styles.buttonText}>
          Manage Subscription
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    padding: 20,
    paddingTop: 55,
  },

  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    marginTop: 20,
  },

  subtitle: {
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
    marginBottom: 18,
    fontFamily: "Inter_400Regular",
  },

  card: {
    backgroundColor: "#C44736",
    borderRadius: 16,
    alignItems: "center",
    padding: 22,
    marginBottom: 30,
  },

  icon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },

  plan: {
    color: "#FFF",
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    marginTop: 18,
  },

  status: {
    color: "#FDECEC",
    marginTop: 6,
  },

  section: {
    color: "#C44736",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    marginBottom: 14,
  },

  feature: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  featureText: {
    marginLeft: 10,
    fontSize: 15,
    color: "#111827",
  },

  infoCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
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

  infoTitle: {
    color: "#6B7280",
  },

  infoValue: {
    marginTop: 8,
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#34A853",
  },

  button: {
    backgroundColor: "#C44736",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFF",
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
  },
});
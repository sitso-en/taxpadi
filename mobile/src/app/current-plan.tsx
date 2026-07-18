import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { getSubscriptionStatus } from "../services/subscriptions.service";
import { getUserFriendlyError } from "@/utils/error";
import { useToast } from "@/context/ToastContext";

type SubscriptionStatus = {
  plan: string;
  status: string;
  expires_at?: string;
};

const PLAN_FEATURES: Record<string, string[]> = {
  FREE: [
    "Transaction Tracking",
    "Invoice Management",
    "Tax Return Filing",
    "Reports & Export",
  ],
  PRO: [
    "Unlimited Transactions",
    "Invoice Management",
    "Reports & Export",
    "Tax Return Filing",
    "Compliance Certificate",
    "Priority Support",
  ],
  BUSINESS: [
    "Everything in PRO",
    "Team Management",
    "Bulk Operations",
    "Dedicated Support",
  ],
};

export default function CurrentPlanScreen() {
  const { showToast } = useToast();
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await getSubscriptionStatus();
      setStatus(res.data);
    } catch (error: any) {
      showToast(getUserFriendlyError(error), "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#C44736" />
      </View>
    );
  }

  const plan = status?.plan ?? "FREE";
  const isActive = status?.status === "active";
  const features = PLAN_FEATURES[plan] ?? PLAN_FEATURES["FREE"];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 48 }}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={26} color="#111827" />
      </TouchableOpacity>

      <Text style={styles.title}>Current Plan</Text>
      <Text style={styles.subtitle}>Your active TaxPadi subscription.</Text>

      <View style={styles.card}>
        <View style={styles.icon}>
          <Ionicons name="diamond-outline" size={28} color="#FFFFFF" />
        </View>

        <Text style={styles.plan}>
          {plan.charAt(0).toUpperCase() + plan.slice(1).toLowerCase()}
        </Text>

        <Text style={styles.status}>
          {isActive ? "Active Subscription" : "Free Subscription"}
        </Text>

        {status?.expires_at && (
          <Text style={styles.expiry}>
            Renews{" "}
            {new Date(status.expires_at).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </Text>
        )}
      </View>

      <Text style={styles.section}>INCLUDED FEATURES</Text>

      {features.map((item) => (
        <View key={item} style={styles.feature}>
          <Ionicons name="checkmark-circle" size={22} color="#34A853" />
          <Text style={styles.featureText}>{item}</Text>
        </View>
      ))}

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Billing Status</Text>
        <Text style={[styles.infoValue, { color: isActive ? "#34A853" : "#6B7280" }]}>
          {isActive ? "Active" : "Free"}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/manage-plan")}
      >
        <Text style={styles.buttonText}>Manage Subscription</Text>
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

  centered: {
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    marginTop: 20,
  },

  subtitle: {
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
    marginBottom: 16,
    fontFamily: "Inter_400Regular",
  },

  card: {
    backgroundColor: "#C44736",
    borderRadius: 20,
    alignItems: "center",
    padding: 20,
    marginBottom: 20,
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

  expiry: {
    color: "#FDECEC",
    marginTop: 4,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
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
    marginTop: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ECECEC",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  infoTitle: {
    color: "#6B7280",
  },

  infoValue: {
    marginTop: 8,
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },

  button: {
    backgroundColor: "#C44736",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFF",
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
  },
});

import React, { useCallback, useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  cancelSubscription,
  getSubscriptionStatus,
  subscribe,
} from "../services/subscriptions.service";
import { getUserFriendlyError } from "@/utils/error";
import { useToast } from "@/context/ToastContext";
import { useNetwork } from "@/context/NetworkContext";

type SubscriptionStatus = {
  plan: string;
  status: string;
  expires_at?: string;
  renewal_date?: string;
};

const FREE_FEATURES = [
  "Transaction Tracking",
  "Tax Return Management",
  "Payment Tracking",
  "Reports & Analytics",
  "Invoice Management",
];

const PRO_FEATURES = [
  "Everything in Free",
  "Unlimited Transactions",
  "Advanced Reports",
  "Priority Support",
  "AI Tax Insights",
  "Cloud Backup",
  "Export to PDF & Excel",
  "Premium Notifications",
];

export default function SubscriptionScreen() {
  const { showToast } = useToast();
  const { isOnline } = useNetwork();
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

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

  const isPro = status?.plan !== "FREE" && status?.plan != null;

  const handleUpgrade = async () => {
    if (!isOnline) {
      showToast("You're offline. Connect to the internet to upgrade your plan.", "info");
      return;
    }
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const res = await subscribe("PRO");
      const paymentUrl: string =
        res.data?.payment_url ??
        res.data?.authorization_url ??
        res.data?.checkout_url;
      if (paymentUrl) {
        await Linking.openURL(paymentUrl);
      } else {
        // Subscription activated directly (e.g. free trial or admin grant)
        await load();
        showToast("Welcome to TaxPadi shnigger_muffin!", "success");
      }
    } catch (error: any) {
      showToast(getUserFriendlyError(error), "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!isOnline) {
      showToast("You're offline. Connect to the internet to cancel your subscription.", "info");
      return;
    }
    setActionLoading(true);
    try {
      await cancelSubscription();
      await load();
      showToast("Your subscription has been cancelled.", "info");
    } catch (error: any) {
      showToast(getUserFriendlyError(error), "error");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#C44736" />
      </View>
    );
  }

  const features = isPro ? PRO_FEATURES : FREE_FEATURES;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Subscription</Text>
      </View>

      {/* Current Plan Card */}
      <View style={styles.planCard}>
        <Ionicons
          name={isPro ? "rocket-outline" : "card-outline"}
          size={32}
          color="#C44736"
        />

        <Text style={styles.planName}>
          {isPro ? `${status?.plan} Plan` : "Free Plan"}
        </Text>

        <Text style={styles.planDescription}>
          {isPro
            ? "Enjoy premium TaxPadi features with advanced analytics, exports and AI-powered tax assistance."
            : "Basic tax management features with transactions, tax returns, payments, invoices and reports."}
        </Text>

        {isPro && status?.expires_at && (
          <Text style={styles.expiryText}>
            Renews{" "}
            {new Date(status.expires_at).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </Text>
        )}

        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>CURRENT PLAN</Text>
        </View>
      </View>

      {/* Features */}
      <View style={styles.featuresCard}>
        <Text style={styles.sectionTitle}>Included Features</Text>

        {features.map((feature) => (
          <View key={feature} style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={18} color="#34A853" />
            <Text style={styles.feature}>{feature}</Text>
          </View>
        ))}
      </View>

      {/* Action */}
      {isPro ? (
        <TouchableOpacity
          style={[styles.cancelButton, actionLoading && { opacity: 0.7 }]}
          onPress={handleCancel}
        >
          {actionLoading ? (
            <ActivityIndicator color="#C44736" />
          ) : (
            <>
              <Ionicons
                name="arrow-down-circle-outline"
                size={20}
                color="#C44736"
              />
              <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
            </>
          )}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.actionButton, actionLoading && { opacity: 0.7 }]}
          onPress={handleUpgrade}
        >
          {actionLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="rocket-outline" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Upgrade to Pro</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2EDE8",
    padding: 20,
    paddingTop: 55,
  },

  centered: {
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 24,
    color: "#111827",
    fontFamily: "Inter_700Bold",
    marginLeft: 10,
  },

  planCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
  },

  planName: {
    fontSize: 24,
    color: "#C44736",
    fontFamily: "Inter_700Bold",
    marginTop: 12,
  },

  planDescription: {
    color: "#6B7280",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 22,
    fontFamily: "Inter_400Regular",
  },

  expiryText: {
    color: "#9CA3AF",
    fontSize: 13,
    marginTop: 8,
    fontFamily: "Inter_400Regular",
  },

  statusBadge: {
    marginTop: 18,
    backgroundColor: "#FCE8E6",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },

  statusText: {
    color: "#C44736",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },

  featuresCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 18,
    color: "#111827",
    fontFamily: "Inter_700Bold",
    marginBottom: 16,
  },

  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  feature: {
    marginLeft: 10,
    color: "#111827",
    fontFamily: "Inter_400Regular",
  },

  actionButton: {
    backgroundColor: "#C44736",
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  actionButtonText: {
    color: "#FFFFFF",
    marginLeft: 8,
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },

  cancelButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#C44736",
  },

  cancelButtonText: {
    color: "#C44736",
    marginLeft: 8,
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});

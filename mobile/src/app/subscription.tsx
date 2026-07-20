import React, { useCallback, useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
  subscription_tier?: string;
  plan?: string;
  status?: string;
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

const MOMO_PROVIDERS = ["MTN", "Vodafone", "AirtelTigo"];

export default function SubscriptionScreen() {
  const { showToast } = useToast();
  const { isOnline } = useNetwork();
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Upgrade form state
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">("monthly");
  const [paymentMethod, setPaymentMethod] = useState<"momo" | "card">("momo");
  const [momoProvider, setMomoProvider] = useState("MTN");
  const [momoNumber, setMomoNumber] = useState("");

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

  const isPro = status?.subscription_tier === "paid";

  const handleUpgrade = async () => {
    if (!isOnline) {
      showToast("You're offline. Connect to the internet to upgrade your plan.", "info");
      return;
    }
    if (paymentMethod === "momo" && !momoNumber.trim()) {
      showToast("Please enter your MoMo number.", "error");
      return;
    }
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const payload: any = {
        plan: selectedPlan,
        payment_method: paymentMethod,
      };
      if (paymentMethod === "momo") {
        payload.momo_number = momoNumber.trim();
        payload.momo_provider = momoProvider;
      }
      const res = await subscribe(payload);
      const paymentUrl: string =
        res.data?.payment_url ??
        res.data?.authorization_url ??
        res.data?.checkout_url;
      if (paymentUrl) {
        await Linking.openURL(paymentUrl);
      } else {
        // Subscription activated directly (e.g. dev mode with blank Paystack key)
        await load();
        showToast("Welcome to TaxPadi Pro!", "success");
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
          {isPro ? "Pro Plan" : "Free Plan"}
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
              <Ionicons name="arrow-down-circle-outline" size={20} color="#C44736" />
              <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
            </>
          )}
        </TouchableOpacity>
      ) : (
        <>
          {/* Upgrade Form */}
          <View style={styles.upgradeForm}>
            <Text style={styles.sectionTitle}>Upgrade to Pro</Text>

            {/* Plan selector */}
            <Text style={styles.fieldLabel}>Billing Period</Text>
            <View style={styles.chipRow}>
              <TouchableOpacity
                style={[styles.chip, selectedPlan === "monthly" && styles.chipActive]}
                onPress={() => setSelectedPlan("monthly")}
              >
                <Text style={[styles.chipText, selectedPlan === "monthly" && styles.chipTextActive]}>
                  Monthly — GHS 19
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.chip, selectedPlan === "annual" && styles.chipActive]}
                onPress={() => setSelectedPlan("annual")}
              >
                <Text style={[styles.chipText, selectedPlan === "annual" && styles.chipTextActive]}>
                  Annual — GHS 180
                </Text>
              </TouchableOpacity>
            </View>

            {/* Payment method */}
            <Text style={styles.fieldLabel}>Payment Method</Text>
            <View style={styles.chipRow}>
              <TouchableOpacity
                style={[styles.chip, paymentMethod === "momo" && styles.chipActive]}
                onPress={() => setPaymentMethod("momo")}
              >
                <Text style={[styles.chipText, paymentMethod === "momo" && styles.chipTextActive]}>
                  MoMo
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.chip, paymentMethod === "card" && styles.chipActive]}
                onPress={() => setPaymentMethod("card")}
              >
                <Text style={[styles.chipText, paymentMethod === "card" && styles.chipTextActive]}>
                  Card
                </Text>
              </TouchableOpacity>
            </View>

            {/* MoMo fields */}
            {paymentMethod === "momo" && (
              <>
                <Text style={styles.fieldLabel}>MoMo Provider</Text>
                <View style={styles.chipRow}>
                  {MOMO_PROVIDERS.map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[styles.chip, momoProvider === p && styles.chipActive]}
                      onPress={() => setMomoProvider(p)}
                    >
                      <Text style={[styles.chipText, momoProvider === p && styles.chipTextActive]}>
                        {p}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.fieldLabel}>MoMo Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 0241234567"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  value={momoNumber}
                  onChangeText={setMomoNumber}
                />
              </>
            )}
          </View>

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
        </>
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

  upgradeForm: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },

  fieldLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "Inter_600SemiBold",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },

  chip: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
  },

  chipActive: {
    backgroundColor: "#C44736",
    borderColor: "#C44736",
  },

  chipText: {
    fontSize: 13,
    color: "#374151",
    fontFamily: "Inter_400Regular",
  },

  chipTextActive: {
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
  },

  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: "#111827",
    fontFamily: "Inter_400Regular",
    backgroundColor: "#F9FAFB",
    marginBottom: 8,
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

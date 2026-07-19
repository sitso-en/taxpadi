import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";

import {
  getSubscriptionPlans,
  getSubscriptionStatus,
  subscribe,
  cancelSubscription,
} from "../services/subscriptions.service";
import { getUserFriendlyError } from "@/utils/error";
import { useToast } from "@/context/ToastContext";
import { useNetwork } from "@/context/NetworkContext";
import { useUser } from "@/context/UserContext";

const PLAN_NICKNAMES: Record<string, string> = {
  free: "wiggly_faraday",
  monthly: "peppy_kepler",
  annual: "goofy_euler",
};

const FREE_FEATURES = [
  "Up to 50 transactions/month",
  "Basic tax summary",
  "Invoice viewing",
];

type Plan = {
  plan: string;
  price: number;
  currency: string;
  billing_cycle: string;
  features: string[];
  savings?: string;
};

const momoProviders = [
  { label: "MTN MoMo", value: "mtn" },
  { label: "Telecel Cash", value: "telecel" },
  { label: "AT / AirtelTigo", value: "airteltigo" },
];

type Status = {
  subscription_tier: string;
  status: string;
  expires_at?: string;
  auto_renew?: boolean;
};

type SelectedPlan = "monthly" | "annual" | null;
type PaymentMethod = "momo" | "bank_card" | null;

export default function ManagePlanScreen() {
  const { showToast } = useToast();
  const { isOnline } = useNetwork();
  const { user } = useUser();

  const [status, setStatus] = useState<Status | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedPlan, setSelectedPlan] = useState<SelectedPlan>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [momoNumber, setMomoNumber] = useState(
    user?.phoneNumber?.replace(/\s/g, "") ?? ""
  );
  const [momoProvider, setMomoProvider] = useState("mtn");

  const [subscribing, setSubscribing] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(async () => {
    try {
      const [statusRes, plansRes] = await Promise.all([
        getSubscriptionStatus(),
        getSubscriptionPlans(),
      ]);
      setStatus(statusRes.data ?? statusRes);
      setPlans(plansRes.data ?? plansRes ?? []);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const isPaid = status?.subscription_tier === "paid";
  const isActive = isPaid && status?.status === "ACTIVE";
  const isCancelled = isPaid && status?.status === "CANCELLED";

  const handleSelectPlan = (plan: SelectedPlan) => {
    if (selectedPlan === plan) {
      setSelectedPlan(null);
      setPaymentMethod(null);
    } else {
      setSelectedPlan(plan);
      setPaymentMethod(null);
    }
  };

  const handleSubscribe = async () => {
    if (!isOnline) {
      showToast("You're offline. Connect to the internet to subscribe.", "info");
      return;
    }
    if (!selectedPlan || !paymentMethod) return;
    if (paymentMethod === "momo" && !momoNumber.trim()) {
      showToast("Enter your MoMo number.", "error");
      return;
    }
    if (subscribing) return;

    setSubscribing(true);
    try {
      const res = await subscribe({
        plan: selectedPlan,
        payment_method: paymentMethod,
        momo_number: paymentMethod === "momo" ? momoNumber.trim() : undefined,
        momo_provider: paymentMethod === "momo" ? momoProvider : undefined,
      });

      const url =
        res.data?.authorization_url ??
        res.data?.payment_url ??
        res.data?.checkout_url;

      if (url) {
        await Linking.openURL(url);
        showToast("Complete your payment in the browser. Your plan will activate automatically.", "info");
      } else if (paymentMethod === "momo") {
        showToast("A payment prompt has been sent to your phone. Approve it to activate your plan.", "info");
      } else {
        showToast("Subscription activated successfully!", "success");
        await load();
      }
      setSelectedPlan(null);
      setPaymentMethod(null);
    } catch (error: any) {
      showToast(getUserFriendlyError(error), "error");
    } finally {
      setSubscribing(false);
    }
  };

  const handleCancel = async () => {
    if (!isOnline) {
      showToast("You're offline. Connect to the internet to cancel.", "info");
      return;
    }
    if (cancelling) return;
    setCancelling(true);
    try {
      await cancelSubscription();
      showToast("Subscription cancelled. You'll keep access until your billing period ends.", "info");
      await load();
    } catch (error: any) {
      showToast(getUserFriendlyError(error), "error");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#C44736" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F2EDE8" }}
      behavior="padding"
    >
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 60 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Ionicons name="chevron-back" size={26} color="#111827" />
      </TouchableOpacity>
      <Text style={styles.title}>Manage Plan</Text>
      <Text style={styles.subtitle}>Choose a plan that works for your business.</Text>

      {/* Current Status Banner */}
      <View style={[styles.statusBanner, isPaid ? styles.statusBannerPaid : styles.statusBannerFree]}>
        <Ionicons
          name={isPaid ? "diamond" : "shield-outline"}
          size={18}
          color={isPaid ? "#B83729" : "#6B7280"}
          style={{ marginRight: 8 }}
        />
        <View style={{ flex: 1 }}>
          <Text style={[styles.statusLabel, { color: isPaid ? "#B83729" : "#6B7280" }]}>
            {isPaid ? "PAID PLAN" : "FREE PLAN"}{isCancelled ? " · CANCELLED" : ""}
          </Text>
          {status?.expires_at && (
            <Text style={styles.statusExpiry}>
              {isCancelled ? "Access until " : "Renews "}
              {new Date(status.expires_at).toLocaleDateString("en-GB", {
                day: "numeric", month: "short", year: "numeric",
              })}
            </Text>
          )}
        </View>
      </View>

      {/* FREE card */}
      <View style={[styles.planCard, !isPaid && styles.planCardActive]}>
        <View style={styles.planHeader}>
          <View>
            <Text style={styles.planName}>Free</Text>
            <Text style={styles.planNickname}>{PLAN_NICKNAMES.free}</Text>
            <Text style={styles.planPrice}>GH¢0 <Text style={styles.planCycle}>forever</Text></Text>
          </View>
          {!isPaid && (
            <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeText}>CURRENT</Text>
            </View>
          )}
        </View>
        {FREE_FEATURES.map((f) => (
          <View key={f} style={styles.featureRow}>
            <Ionicons name="checkmark-circle-outline" size={16} color="#9CA3AF" />
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}
      </View>

      {/* Paid plan cards from backend */}
      {plans.map((plan) => {
        const isMonthly = plan.plan === "monthly";
        const nameColor = isMonthly ? "#C44736" : "#1D6F42";
        const checkColor = isMonthly ? "#34A853" : "#1D6F42";
        const planKey = plan.plan as SelectedPlan;

        return (
          <TouchableOpacity
            key={plan.plan}
            style={[styles.planCard, selectedPlan === planKey && styles.planCardSelected]}
            onPress={() => !isActive && handleSelectPlan(planKey)}
            activeOpacity={isActive ? 1 : 0.85}
          >
            <View style={styles.planHeader}>
              <View>
                <Text style={[styles.planName, { color: nameColor }]}>
                  {plan.plan.charAt(0).toUpperCase() + plan.plan.slice(1)}
                </Text>
                <Text style={styles.planNickname}>{PLAN_NICKNAMES[plan.plan] ?? ""}</Text>
                <Text style={styles.planPrice}>
                  GH¢{plan.price}{" "}
                  <Text style={styles.planCycle}>
                    {isMonthly ? "/ month" : "/ year"}
                  </Text>
                </Text>
                <Text style={styles.billingCycle}>{plan.billing_cycle}</Text>
              </View>
              {isActive && (
                <View style={[styles.currentBadge, { backgroundColor: nameColor + "20" }]}>
                  <Text style={[styles.currentBadgeText, { color: nameColor }]}>CURRENT</Text>
                </View>
              )}
              {plan.savings && !isActive && (
                <View style={styles.savingsBadge}>
                  <Text style={styles.savingsBadgeText}>{plan.savings}</Text>
                </View>
              )}
            </View>
            {plan.features.map((f) => (
              <View key={f} style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={16} color={checkColor} />
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
          </TouchableOpacity>
        );
      })}

      {/* Payment section — shown when a plan is selected */}
      {selectedPlan && (
        <View style={styles.paymentSection}>
          <Text style={styles.sectionLabel}>PAYMENT METHOD</Text>

          <View style={styles.methodRow}>
            <TouchableOpacity
              style={[styles.methodBtn, paymentMethod === "momo" && styles.methodBtnActive]}
              onPress={() => setPaymentMethod("momo")}
            >
              <Ionicons name="phone-portrait-outline" size={16} color={paymentMethod === "momo" ? "#C44736" : "#6B7280"} />
              <Text style={[styles.methodBtnText, paymentMethod === "momo" && styles.methodBtnTextActive]}>Mobile Money</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.methodBtn, paymentMethod === "bank_card" && styles.methodBtnActive]}
              onPress={() => setPaymentMethod("bank_card")}
            >
              <Ionicons name="card-outline" size={16} color={paymentMethod === "bank_card" ? "#C44736" : "#6B7280"} />
              <Text style={[styles.methodBtnText, paymentMethod === "bank_card" && styles.methodBtnTextActive]}>Card</Text>
            </TouchableOpacity>
          </View>

          {paymentMethod === "momo" && (
            <>
              <Text style={styles.sectionLabel}>MOMO NUMBER</Text>
              <TextInput
                style={styles.input}
                value={momoNumber}
                onChangeText={setMomoNumber}
                placeholder="0241234567"
                keyboardType="phone-pad"
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.sectionLabel}>PROVIDER</Text>
              <Dropdown
                style={styles.dropdown}
                data={momoProviders}
                labelField="label"
                valueField="value"
                value={momoProvider}
                onChange={(item) => setMomoProvider(item.value)}
                selectedTextStyle={styles.dropdownText}
                itemTextStyle={styles.dropdownText}
                placeholderStyle={styles.dropdownText}
                containerStyle={styles.dropdownContainer}
                activeColor="#F2EDE8"
                iconColor="#9CA3AF"
              />
            </>
          )}

          {paymentMethod && (
            <TouchableOpacity
              style={[styles.subscribeBtn, subscribing && { opacity: 0.7 }]}
              onPress={handleSubscribe}
            >
              {subscribing ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.subscribeBtnText}>
                  {(() => {
                    const p = plans.find((pl) => pl.plan === selectedPlan);
                    return p
                      ? `Subscribe · GH¢${p.price}${selectedPlan === "monthly" ? "/mo" : "/yr"}`
                      : "Subscribe";
                  })()}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Cancel */}
      {isActive && (
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={handleCancel}
        >
          {cancelling ? (
            <ActivityIndicator color="#C44736" size="small" />
          ) : (
            <Text style={styles.cancelBtnText}>Cancel Subscription</Text>
          )}
        </TouchableOpacity>
      )}
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2EDE8",
    paddingHorizontal: 16,
    paddingTop: 44,
  },
  back: {
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    marginBottom: 4,
  },
  subtitle: {
    color: "#6B7280",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
    marginBottom: 20,
  },
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
  },
  statusBannerPaid: {
    backgroundColor: "#FFF5F3",
    borderColor: "#F8C5BF",
  },
  statusBannerFree: {
    backgroundColor: "#F3F4F6",
    borderColor: "#E5E7EB",
  },
  statusLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  statusExpiry: {
    color: "#6B7280",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  planCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: "#ECECEC",
  },
  planCardActive: {
    borderColor: "#9CA3AF",
  },
  planCardSelected: {
    borderColor: "#C44736",
    backgroundColor: "#FFFAF9",
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  planName: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#111827",
  },
  planNickname: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
    marginTop: 1,
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  planPrice: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    marginTop: 4,
  },
  planCycle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
  },
  billingCycle: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
    marginTop: 2,
  },
  currentBadge: {
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  currentBadgeText: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    color: "#6B7280",
    letterSpacing: 0.5,
  },
  savingsBadge: {
    backgroundColor: "#D1FAE5",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  savingsBadgeText: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    color: "#1D6F42",
    letterSpacing: 0.3,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  featureText: {
    marginLeft: 8,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#374151",
    flex: 1,
  },
  paymentSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ECECEC",
  },
  sectionLabel: {
    color: "#C44736",
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 4,
  },
  methodRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  methodBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDE8E3",
    borderRadius: 12,
    paddingVertical: 12,
    gap: 6,
  },
  methodBtnActive: {
    backgroundColor: "#FFF5F3",
    borderWidth: 1.5,
    borderColor: "#C44736",
  },
  methodBtnText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: "#6B7280",
  },
  methodBtnTextActive: {
    color: "#C44736",
    fontFamily: "Inter_600SemiBold",
  },
  input: {
    backgroundColor: "#EDE8E3",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#111827",
    marginBottom: 16,
    ...(Platform.OS === "web" ? { outlineWidth: 0 } : {}),
  },
  dropdown: {
    backgroundColor: "#EDE8E3",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 16,
  },
  dropdownText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#111827",
  },
  dropdownContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    overflow: "hidden",
    marginTop: 2,
  },
  subscribeBtn: {
    backgroundColor: "#C44736",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
  },
  subscribeBtnText: {
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  cancelBtn: {
    alignItems: "center",
    paddingVertical: 16,
    marginBottom: 10,
  },
  cancelBtnText: {
    color: "#C44736",
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
});

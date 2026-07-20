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
  verifySubscription,
  cancelSubscription,
} from "../services/subscriptions.service";
import { getUserFriendlyError } from "@/utils/error";
import { useToast } from "@/context/ToastContext";
import { useNetwork } from "@/context/NetworkContext";
import { useUser } from "@/context/UserContext";
import { useSubscription } from "@/context/SubscriptionContext";

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
  plan?: string;
  expires_at?: string;
  auto_renew?: boolean;
};

type SelectedPlan = "monthly" | "annual" | null;
type PaymentMethod = "momo" | "bank_card" | null;

export default function ManagePlanScreen() {
  const { showToast } = useToast();
  const { isOnline } = useNetwork();
  const { user } = useUser();
  const { refresh: refreshSubscriptionContext } = useSubscription();

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
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const load = useCallback(async () => {
    try {
      const [statusRes, plansRes] = await Promise.all([
        getSubscriptionStatus(),
        getSubscriptionPlans(),
      ]);
      setStatus(statusRes.data ?? statusRes);
      const plansData = plansRes.data;
      const plansArray = Array.isArray(plansData)
        ? plansData
        : Array.isArray(plansData?.plans)
        ? plansData.plans
        : [];
      setPlans(plansArray);
    } catch (error: any) {
      showToast(getUserFriendlyError(error), "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const isPaid = status?.subscription_tier === "paid";
  const isActive = isPaid && status?.status?.toLowerCase() === "active";
  const isCancelled = isPaid && status?.status?.toLowerCase() === "cancelled";

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
        showToast("Complete your payment in the browser, then tap 'Verify Payment' below.", "info");
        setPendingVerification(true);
      } else if (paymentMethod === "momo") {
        showToast("A payment prompt has been sent to your phone. Approve it, then tap 'Verify Payment' below.", "info");
        setPendingVerification(true);
      } else {
        showToast("Subscription activated successfully!", "success");
        await load();
        await refreshSubscriptionContext();
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

  const handleVerify = async () => {
    if (!isOnline) {
      showToast("You're offline. Connect to the internet to verify.", "info");
      return;
    }
    if (verifying) return;
    setVerifying(true);
    try {
      await verifySubscription();
      showToast("Subscription activated! You now have full access.", "success");
      setPendingVerification(false);
      await load();
      await refreshSubscriptionContext();
    } catch (error: any) {
      showToast(getUserFriendlyError(error), "error");
    } finally {
      setVerifying(false);
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
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="chevron-back" size={26} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.title}>Manage Plan</Text>
          <View style={{ width: 26 }} />
        </View>
        <Text style={styles.subtitle}>Choose a plan that works for your business.</Text>

        {/* Current plan card */}
        <View style={[styles.statusCard, isPaid ? styles.statusCardPaid : styles.statusCardFree]}>
          <View style={[styles.statusIconBox, { backgroundColor: isPaid ? "rgba(196,71,54,0.12)" : "#F3F4F6" }]}>
            <Ionicons name={isPaid ? "diamond" : "shield-outline"} size={20} color={isPaid ? "#C44736" : "#6B7280"} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.statusPlanLabel, { color: isPaid ? "#C44736" : "#374151" }]}>
              {isPaid ? "Paid Plan" : "Free Plan"}{isCancelled ? " · Cancelled" : ""}
            </Text>
            <Text style={styles.statusSubtext}>
              {status?.expires_at
                ? `${isCancelled ? "Access until" : "Renews"} ${new Date(status.expires_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
                : isPaid ? "Your subscription is active" : "Upgrade for full access"}
            </Text>
          </View>
          {isPaid && (
            <View style={styles.activePill}>
              <Text style={styles.activePillText}>{isCancelled ? "Cancelled" : "Active"}</Text>
            </View>
          )}
        </View>

        {/* Section label */}
        <Text style={styles.sectionLabel}>AVAILABLE PLANS</Text>

        {/* FREE card */}
        <View style={[styles.planCard, !isPaid && styles.planCardCurrent]}>
          <View style={styles.planHeader}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <Text style={styles.planName}>Free</Text>
                {!isPaid && (
                  <View style={styles.currentBadge}>
                    <Text style={styles.currentBadgeText}>CURRENT</Text>
                  </View>
                )}
              </View>
              <Text style={styles.planNickname}>{PLAN_NICKNAMES.free}</Text>
              <Text style={styles.planPrice}>GH¢0 <Text style={styles.planCycle}>forever</Text></Text>
            </View>
          </View>
          <View style={styles.divider} />
          {FREE_FEATURES.map((f) => (
            <View key={f} style={styles.featureRow}>
              <Ionicons name="checkmark-circle-outline" size={16} color="#9CA3AF" />
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
        </View>

        {/* Paid plan cards */}
        {plans.map((plan) => {
          const isMonthly = plan.plan === "monthly";
          const accent = isMonthly ? "#C44736" : "#1D6F42";
          const planKey = plan.plan as SelectedPlan;
          const isSelected = selectedPlan === planKey;
          const isThisPlanCurrent = isActive && status?.plan === plan.plan;

          return (
            <TouchableOpacity
              key={plan.plan}
              style={[styles.planCard, isSelected && styles.planCardSelected, { borderColor: isThisPlanCurrent ? accent : isSelected ? accent : "#EFEFED" }]}
              onPress={() => !isThisPlanCurrent && handleSelectPlan(planKey)}
              activeOpacity={isThisPlanCurrent ? 1 : 0.85}
            >
              <View style={styles.planHeader}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <Text style={[styles.planName, { color: accent }]}>
                      {plan.plan.charAt(0).toUpperCase() + plan.plan.slice(1)}
                    </Text>
                    {isThisPlanCurrent && (
                      <View style={[styles.currentBadge, { backgroundColor: accent + "18" }]}>
                        <Text style={[styles.currentBadgeText, { color: accent }]}>CURRENT</Text>
                      </View>
                    )}
                    {plan.savings && !isThisPlanCurrent && (
                      <View style={styles.savingsBadge}>
                        <Text style={styles.savingsBadgeText}>{plan.savings}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.planNickname}>{PLAN_NICKNAMES[plan.plan] ?? ""}</Text>
                  <Text style={[styles.planPrice, { color: accent }]}>
                    GH¢{plan.price}{" "}
                    <Text style={styles.planCycle}>{isMonthly ? "/ month" : "/ year"}</Text>
                  </Text>
                  {plan.billing_cycle ? <Text style={styles.billingCycle}>{plan.billing_cycle}</Text> : null}
                </View>
                {!isThisPlanCurrent && (
                  <View style={[styles.selectCircle, isSelected && { borderColor: accent, backgroundColor: accent }]}>
                    {isSelected && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                  </View>
                )}
              </View>
              <View style={styles.divider} />
              {plan.features.map((f) => (
                <View key={f} style={styles.featureRow}>
                  <Ionicons name="checkmark-circle" size={16} color={accent} />
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
            </TouchableOpacity>
          );
        })}

        {!isPaid && plans.length > 0 && !selectedPlan && (
          <Text style={styles.tapHint}>Tap a plan above to subscribe</Text>
        )}

        {/* Payment section */}
        {selectedPlan && (
          <View style={styles.paymentCard}>
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
                <Text style={styles.fieldLabel}>MOMO NUMBER</Text>
                <TextInput
                  style={styles.input}
                  value={momoNumber}
                  onChangeText={setMomoNumber}
                  placeholder="0241234567"
                  keyboardType="phone-pad"
                  placeholderTextColor="#9CA3AF"
                />
                <Text style={styles.fieldLabel}>PROVIDER</Text>
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
                style={[styles.primaryBtn, subscribing && { opacity: 0.7 }]}
                onPress={handleSubscribe}
              >
                {subscribing ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryBtnText}>
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

        {/* Verify payment */}
        {pendingVerification && (
          <TouchableOpacity
            style={[styles.primaryBtn, verifying && { opacity: 0.7 }, { marginBottom: 12 }]}
            onPress={handleVerify}
          >
            {verifying ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.primaryBtnText}>Verify Payment</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Cancel subscription */}
        {isActive && !isCancelled && (
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  title: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: "#111827",
  },
  subtitle: {
    color: "#6B7280",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
    marginBottom: 20,
  },

  /* Current plan card */
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  statusCardPaid: {
    backgroundColor: "#FFFFFF",
    borderColor: "#F8C5BF",
  },
  statusCardFree: {
    backgroundColor: "#FFFFFF",
    borderColor: "#EFEFED",
  },
  statusIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  statusPlanLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    marginBottom: 3,
  },
  statusSubtext: {
    color: "#6B7280",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 16,
  },
  activePill: {
    backgroundColor: "#DCFCE7",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  activePillText: {
    color: "#15803D",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },

  /* Section label */
  sectionLabel: {
    color: "#C44736",
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
    marginBottom: 12,
  },

  /* Plan cards */
  planCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: "#EFEFED",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  planCardCurrent: {
    borderColor: "#9CA3AF",
  },
  planCardSelected: {
    backgroundColor: "#FFFAF9",
  },
  planHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  planName: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#111827",
  },
  planNickname: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  planPrice: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: "#111827",
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
    backgroundColor: "#F3F4F6",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  currentBadgeText: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    color: "#6B7280",
    letterSpacing: 0.5,
  },
  savingsBadge: {
    backgroundColor: "#D1FAE5",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  savingsBadgeText: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    color: "#1D6F42",
    letterSpacing: 0.3,
  },
  selectCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginBottom: 12,
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
  tapHint: {
    color: "#9CA3AF",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginBottom: 16,
    marginTop: 4,
  },

  /* Payment card */
  paymentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EFEFED",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  fieldLabel: {
    color: "#C44736",
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
    marginBottom: 8,
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
    backgroundColor: "#F3F4F6",
    borderRadius: 14,
    paddingVertical: 13,
    gap: 6,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  methodBtnActive: {
    backgroundColor: "#FFF5F3",
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
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#111827",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EFEFED",
    ...(Platform.OS === "web" ? { outlineWidth: 0 } : {}),
  },
  dropdown: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EFEFED",
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
  primaryBtn: {
    backgroundColor: "#C44736",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: "#C44736",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  cancelBtn: {
    alignItems: "center",
    paddingVertical: 16,
    marginBottom: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EFEFED",
    backgroundColor: "#FFFFFF",
  },
  cancelBtnText: {
    color: "#C44736",
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
});

import React, { useEffect, useRef, useState } from "react";
import { getUserFriendlyError } from "@/utils/error";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Linking } from "react-native";
import { useUser } from "../../context/UserContext";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useToast } from "@/context/ToastContext";
import { useNetwork } from "@/context/NetworkContext";
import { usePrivacy } from "@/context/PrivacyContext";
import ErrorState from "@/components/ErrorState";
import { usePayments } from "../../context/PaymentContext";
import { getPaymentStatus, confirmPayment } from "@/services/payment.service";
import { getTaxReturns } from "@/services/taxReturns.service";
import { useTaxLiability } from "@/context/TaxLiabilityContext";
import { useSavings } from "@/context/SavingsContext";

const fmt = (n: number) =>
  `GH¢ ${n.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const METHOD_ICON: Record<string, any> = {
  momo: "phone-portrait-outline",
  bank: "card-outline",
  vault: "lock-closed-outline",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  SUCCESS: { label: "Paid",    color: "#16A34A", bg: "#DCFCE7" },
  PAID:    { label: "Paid",    color: "#16A34A", bg: "#DCFCE7" },
  PENDING: { label: "Pending", color: "#D97706", bg: "#FEF3C7" },
  FAILED:  { label: "Failed",  color: "#DC2626", bg: "#FEE2E2" },
};

export default function PaymentsScreen() {
  const { user } = useUser();
  const { payments, loading, error, createPayment, refreshPayments } = usePayments();
  const { showToast } = useToast();
  const { isOnline } = useNetwork();
  const { amountsHidden, toggleAmountsHidden } = usePrivacy();
  const { liability } = useTaxLiability();
  const { totalSaved } = useSavings();

  const [paymentMethod, setPaymentMethod] = useState<"momo" | "bank" | "vault">("momo");
  const [paying, setPaying] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [payAmountText, setPayAmountText] = useState("");
  const [momoNumber, setMomoNumber] = useState("");
  const [momoProvider, setMomoProvider] = useState<"mtn" | "telecel" | "airteltigo">("mtn");
  const [pendingReturnId, setPendingReturnId] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  // Pre-fill MoMo number from user profile
  useEffect(() => {
    if (user?.phoneNumber && !momoNumber) {
      setMomoNumber(user.phoneNumber.replace(/\s/g, ""));
    }
  }, [user?.phoneNumber]);

  // Fetch most recent submitted tax return to link payment to
  useEffect(() => {
    getTaxReturns({ status: "submitted", limit: 1 })
      .then((res) => {
        const returns = res.data?.returns ?? res.data ?? [];
        if (returns.length > 0) {
          setPendingReturnId(returns[0].return_id);
        }
      })
      .catch(() => {});
  }, []);


  const netLiability = liability?.net_liability ?? 0;

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshPayments(false);
    setRefreshing(false);
  };

  const totalPaid = payments
    .filter((p: any) => ["SUCCESS", "PAID"].includes(p.status?.toUpperCase()))
    .reduce((sum: number, p: any) => sum + Number(p.amount), 0);

  const remainingBalance = Math.max(netLiability - totalPaid, 0);
  const paidPct = netLiability > 0 ? Math.min((totalPaid / netLiability) * 100, 100) : 0;

  // Pre-fill amount when remaining balance first loads
  useEffect(() => {
    if (remainingBalance > 0 && !payAmountText) {
      setPayAmountText(remainingBalance.toFixed(2));
    }
  }, [remainingBalance]);

  const payAmount = parseFloat(payAmountText) || 0;
  const amountError =
    payAmountText && payAmount <= 0 ? "Enter a valid amount" :
    payAmount > remainingBalance ? "Amount exceeds your outstanding balance" :
    null;
  const vaultInsufficient = paymentMethod === "vault" && payAmount > totalSaved;
  const canPay = !paying && payAmount > 0 && !amountError && !vaultInsufficient && remainingBalance > 0;

  const startPolling = (paymentId: string) => {
    let attempts = 0;
    pollRef.current = setInterval(async () => {
      attempts++;
      try {
        const statusRes = await getPaymentStatus(paymentId);
        const status = (statusRes.data?.status ?? statusRes.status ?? "").toUpperCase();
        if (["SUCCESS", "PAID"].includes(status)) {
          clearInterval(pollRef.current!);
          pollRef.current = null;
          const ref = statusRes.data?.payment_reference ?? statusRes.payment_reference ?? "";
          try { await confirmPayment(paymentId, { status: "SUCCESS", payment_reference: ref }); } catch {}
          await refreshPayments(false);
          showToast("Payment confirmed!", "success");
          setPaying(false);
        } else if (status === "FAILED") {
          clearInterval(pollRef.current!);
          pollRef.current = null;
          await refreshPayments(false);
          showToast("Payment failed. Please try again.", "error");
          setPaying(false);
        } else if (attempts >= 20) {
          clearInterval(pollRef.current!);
          pollRef.current = null;
          await refreshPayments(false);
          showToast("Payment is taking longer than expected. Pull down to refresh.", "info");
          setPaying(false);
        }
      } catch {
        if (attempts >= 20) {
          clearInterval(pollRef.current!);
          pollRef.current = null;
          setPaying(false);
        }
      }
    }, 3000);
  };

  const handlePayment = async () => {
    if (!isOnline) {
      showToast("You're offline. Connect to the internet to process a payment.", "info");
      return;
    }
    if (!canPay) return;

    setPaying(true);
    try {
      if (!pendingReturnId) {
        showToast("No submitted tax return found. Please file a return before making a payment.", "error");
        setPaying(false);
        return;
      }

      const response = await createPayment({
        amount: payAmount,
        return_id: pendingReturnId,
        payment_method: paymentMethod === "momo" ? "momo" : paymentMethod === "vault" ? "vault" : "bank_card",
        momo_number: paymentMethod === "momo" ? momoNumber.replace(/\s/g, "") : undefined,
        momo_provider: paymentMethod === "momo" ? momoProvider : undefined,
      });

      const url =
        response.data?.authorization_url ??
        response.data?.payment_url ??
        response.data?.checkout_url;

      if (url) {
        await Linking.openURL(url);
        showToast("Complete your payment in the browser. Your history will update shortly.", "info");
        setPaying(false);
      } else {
        const paymentId = response.data?.payment_id;
        if (paymentId) {
          showToast("Payment initiated. Checking status…", "info");
          startPolling(paymentId);
          // setPaying stays true until polling resolves
        } else {
          showToast("Payment initiated. Your history will update shortly.", "success");
          setPaying(false);
        }
      }
    } catch (err: any) {
      showToast(getUserFriendlyError(err), "error");
      setPaying(false);
    }
  };

  const methods: { key: "momo" | "bank" | "vault"; label: string; detail: string }[] = [
    { key: "momo",  label: "Mobile Money",  detail: "Enter your MoMo number below" },
    { key: "bank",  label: "Bank Card",     detail: "You'll be redirected to complete payment" },
    { key: "vault", label: "Savings Vault", detail: `Available: ${fmt(totalSaved)}` },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#C44736"]} tintColor="#C44736" />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Payments</Text>
        </View>

        {/* Hero card */}
        <LinearGradient
          colors={["#C44736", "#8B2318"]}
          style={styles.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroArcOuter} pointerEvents="none" />
          <View style={styles.heroArcInner} pointerEvents="none" />

          <View style={styles.heroTop}>
            <View style={styles.heroIconBox}>
              <Ionicons name="receipt-outline" size={20} color="#FFFFFF" />
            </View>
            <TouchableOpacity onPress={toggleAmountsHidden} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons
                name={amountsHidden ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="rgba(255,255,255,0.7)"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.heroLabel}>OUTSTANDING BALANCE</Text>
          <Text style={styles.heroAmount}>
            {amountsHidden ? "GH¢ ••••••" : fmt(remainingBalance)}
          </Text>

          {/* Progress bar */}
          <View style={styles.progressWrap}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${paidPct}%` as any }]} />
            </View>
            <Text style={styles.progressLabel}>{Math.round(paidPct)}% paid</Text>
          </View>

          {/* Stats row */}
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatVal} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.65}>{amountsHidden ? "••••" : fmt(netLiability)}</Text>
              <Text style={styles.heroStatLabel}>Total Liability</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={[styles.heroStatVal, { color: "#86EFAC" }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.65}>
                {amountsHidden ? "••••" : fmt(totalPaid)}
              </Text>
              <Text style={styles.heroStatLabel}>Paid</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatVal} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.65}>{amountsHidden ? "••••" : fmt(remainingBalance)}</Text>
              <Text style={styles.heroStatLabel}>Remaining</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Amount input */}
        <View style={styles.amountSection}>
          <Text style={styles.sectionTitle}>Amount to Pay (GHS)</Text>
          <TextInput
            style={[styles.amountInput, amountError ? styles.amountInputError : null]}
            value={payAmountText}
            onChangeText={setPayAmountText}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor="#9CA3AF"
          />
          {amountError ? (
            <Text style={styles.amountErrorText}>{amountError}</Text>
          ) : (
            <Text style={styles.amountHint}>Outstanding: {fmt(remainingBalance)}</Text>
          )}
        </View>

        {/* Payment Method */}
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.methodList}>
          {methods.map((m) => {
            const active = paymentMethod === m.key;
            return (
              <View key={m.key}>
                <TouchableOpacity
                  style={[styles.methodCard, active && styles.methodCardActive]}
                  onPress={() => setPaymentMethod(m.key)}
                  activeOpacity={0.75}
                >
                  <View style={[styles.methodIconBox, active && styles.methodIconBoxActive]}>
                    <Ionicons name={METHOD_ICON[m.key]} size={18} color={active ? "#C44736" : "#6B7280"} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.methodLabel, active && styles.methodLabelActive]}>{m.label}</Text>
                    <Text style={styles.methodDetail} numberOfLines={1}>{m.detail}</Text>
                  </View>
                  <View style={[styles.radio, active && styles.radioActive]}>
                    {active && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>

                {/* MoMo extra fields */}
                {active && m.key === "momo" && (
                  <View style={styles.extraFields}>
                    <TextInput
                      style={styles.momoInput}
                      value={momoNumber}
                      onChangeText={setMomoNumber}
                      keyboardType="phone-pad"
                      placeholder="MoMo number (e.g. 0241234567)"
                      placeholderTextColor="#9CA3AF"
                    />
                    <View style={styles.providerRow}>
                      {(["mtn", "telecel", "airteltigo"] as const).map((p) => (
                        <TouchableOpacity
                          key={p}
                          style={[styles.providerChip, momoProvider === p && styles.providerChipActive]}
                          onPress={() => setMomoProvider(p)}
                        >
                          <Text style={[styles.providerChipText, momoProvider === p && styles.providerChipTextActive]}>
                            {p === "mtn" ? "MTN" : p === "telecel" ? "Telecel" : "AirtelTigo"}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {/* Vault insufficient warning */}
                {active && m.key === "vault" && vaultInsufficient && (
                  <View style={styles.vaultWarning}>
                    <Ionicons name="warning-outline" size={14} color="#DC2626" />
                    <Text style={styles.vaultWarningText}>
                      Vault balance ({fmt(totalSaved)}) is less than the amount. Top up your vault first.
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Pay button */}
        <TouchableOpacity
          style={[styles.payBtn, !canPay && styles.payBtnDisabled]}
          onPress={handlePayment}
          activeOpacity={0.85}
        >
          {paying ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Ionicons name="arrow-forward-circle-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.payBtnText}>
                {remainingBalance <= 0
                  ? "Nothing to Pay"
                  : canPay
                  ? amountsHidden ? "Pay Now" : `Pay ${fmt(payAmount)}`
                  : "Pay Now"}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Payment History */}
        <Text style={styles.sectionTitle}>Payment History</Text>

        {loading ? (
          <ActivityIndicator color="#C44736" style={{ marginTop: 20 }} />
        ) : error ? (
          <ErrorState onRetry={refreshPayments} />
        ) : payments.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="wallet-outline" size={28} color="#C44736" />
            </View>
            <Text style={styles.emptyTitle}>No Payments Yet</Text>
            <Text style={styles.emptyText}>Completed payments will appear here.</Text>
          </View>
        ) : (
          payments
            .slice()
            .reverse()
            .map((item: any) => {
              const statusKey = item.status?.toUpperCase() ?? "PENDING";
              const cfg = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG.PENDING;
              return (
                <View key={item.payment_id} style={styles.historyCard}>
                  <View style={styles.historyIconBox}>
                    <Ionicons
                      name={METHOD_ICON[item.payment_method?.toLowerCase()] ?? "cash-outline"}
                      size={18}
                      color="#6B7280"
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.historyMethod}>{item.payment_method ?? "Payment"}</Text>
                    <Text style={styles.historyRef} numberOfLines={1}>
                      {item.payment_reference}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end", gap: 4 }}>
                    <Text style={styles.historyAmount}>
                      {amountsHidden ? "••••••" : fmt(Number(item.amount))}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                      <Text style={[styles.statusBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
                    </View>
                  </View>
                </View>
              );
            })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F2EDE8",
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 48,
  },

  // Header
  header: {
    paddingTop: 8,
    paddingBottom: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#111827",
  },

  // Hero
  hero: {
    borderRadius: 24,
    paddingTop: 22,
    paddingBottom: 20,
    paddingHorizontal: 22,
    marginBottom: 14,
    overflow: "hidden",
  },
  heroArcOuter: {
    position: "absolute",
    top: -60,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.1)",
  },
  heroArcInner: {
    position: "absolute",
    top: -20,
    right: -20,
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.07)",
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  heroIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  heroLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  heroAmount: {
    color: "#FFFFFF",
    fontSize: 34,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
    marginBottom: 16,
  },

  // Progress
  progressWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: 6,
    backgroundColor: "#86EFAC",
    borderRadius: 3,
  },
  progressLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },

  // Stats row inside hero
  heroStats: {
    flexDirection: "row",
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.15)",
  },
  heroStat: {
    flex: 1,
    alignItems: "center",
  },
  heroStatVal: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    marginBottom: 2,
  },
  heroStatLabel: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 10,
    fontFamily: "Inter_500Medium",
  },
  heroStatDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginVertical: 2,
  },

  // Pay button
  payBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111827",
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 28,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  payBtnDisabled: {
    backgroundColor: "#9CA3AF",
  },
  payBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },

  // Amount input
  amountSection: {
    marginBottom: 24,
  },
  amountInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    marginBottom: 6,
  },
  amountInputError: {
    borderColor: "#DC2626",
  },
  amountErrorText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#DC2626",
  },
  amountHint: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
  },

  // MoMo extra fields
  extraFields: {
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    padding: 14,
    marginTop: 2,
    marginBottom: 4,
    gap: 10,
  },
  momoInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#111827",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  providerRow: {
    flexDirection: "row",
    gap: 8,
  },
  providerChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  providerChipActive: {
    backgroundColor: "#FDECEC",
    borderColor: "#C44736",
  },
  providerChipText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#6B7280",
  },
  providerChipTextActive: {
    color: "#C44736",
  },

  // Vault warning
  vaultWarning: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    backgroundColor: "#FEE2E2",
    borderRadius: 10,
    padding: 10,
    marginTop: 2,
    marginBottom: 4,
  },
  vaultWarningText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#DC2626",
    lineHeight: 17,
  },

  // Section title
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    marginBottom: 12,
  },

  // Method cards
  methodList: {
    gap: 10,
    marginBottom: 28,
  },
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  methodCardActive: {
    borderColor: "#C44736",
    backgroundColor: "#FFFAF9",
  },
  methodIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  methodIconBoxActive: {
    backgroundColor: "#FDECEC",
  },
  methodLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#374151",
    marginBottom: 2,
  },
  methodLabelActive: {
    color: "#C44736",
  },
  methodDetail: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  radioActive: {
    borderColor: "#C44736",
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#C44736",
  },

  // History
  historyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  historyIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  historyMethod: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#111827",
    marginBottom: 2,
    textTransform: "capitalize",
  },
  historyRef: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
  },
  historyAmount: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: "#111827",
  },
  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },

  // Empty
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    marginTop: 4,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: "#FDECEC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
    textAlign: "center",
  },
});
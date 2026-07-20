import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
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
import { Dropdown } from "react-native-element-dropdown";
import { useSavings } from "../context/SavingsContext";
import { usePrivacy } from "@/context/PrivacyContext";
import { useToast } from "@/context/ToastContext";
import { getUserFriendlyError } from "@/utils/error";
import { useNetwork } from "@/context/NetworkContext";
import SubscriptionGate from "@/components/SubscriptionGate";
import ErrorState from "@/components/ErrorState";
import { useSubscription } from "@/context/SubscriptionContext";

const fmt = (n: number) =>
  `GH¢ ${n.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const PROVIDERS = [
  { label: "MTN MoMo", value: "mtn" },
  { label: "Telecel Cash", value: "telecel" },
  { label: "AirtelTigo Money", value: "airteltigo" },
];

const TRIGGER_LABELS: Record<string, string> = {
  MANUAL: "Manual",
  SUGGESTED: "Suggested",
  TAX_PAYMENT: "Tax Payment",
};

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  SUCCESSFUL: { color: "#16A34A", bg: "#DCFCE7", label: "Successful" },
  PENDING:    { color: "#D97706", bg: "#FEF3C7", label: "Pending" },
  FAILED:     { color: "#DC2626", bg: "#FEE2E2", label: "Failed" },
};

export default function SavingsVaultScreen() {
  const { isPro } = useSubscription();
  const { vault, transactions, suggestion, loading, error, refreshVault, contribute, linkMomo } = useSavings();
  const { amountsHidden, toggleAmountsHidden } = usePrivacy();

  if (!isPro) return (
    <SubscriptionGate
      feature="Savings Vault"
      description="Automatically set aside money for tax payments and earn on idle funds while keeping your savings visible."
      icon="wallet-outline"
    />
  );
  const { showToast } = useToast();
  const { isOnline } = useNetwork();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshVault(false);
    setRefreshing(false);
  };

  // Deposit form
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState("");
  const [contributing, setContributing] = useState(false);

  // Link MoMo form
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [momoNumber, setMomoNumber] = useState("");
  const [momoProvider, setMomoProvider] = useState<"mtn" | "telecel" | "airteltigo">("mtn");
  const [momoNumberError, setMomoNumberError] = useState("");
  const [linking, setLinking] = useState(false);

  const handleDeposit = async () => {
    if (!isOnline) {
      showToast("You're offline. Connect to the internet to make a deposit.", "info");
      return;
    }
    const value = parseFloat(amount.replace(/,/g, ""));
    if (!amount.trim() || isNaN(value) || value <= 0) {
      setAmountError("Enter a valid amount greater than zero.");
      return;
    }
    if (!vault?.momo_linked) {
      showToast("Link a MoMo number first before making a deposit.", "info");
      return;
    }
    setContributing(true);
    try {
      const res = await contribute(value, "manual");
      showToast(
        res.data?.message ?? `MoMo prompt of ${fmt(value)} sent. Approve it on your phone.`,
        "success"
      );
      setAmount("");
    } catch (e: any) {
      showToast(getUserFriendlyError(e), "error");
    } finally {
      setContributing(false);
    }
  };

  const handleSuggestedDeposit = async () => {
    if (!isOnline) {
      showToast("You're offline.", "info");
      return;
    }
    if (!suggestion?.suggested_amount) return;
    if (!vault?.momo_linked) {
      showToast("Link a MoMo number first before making a deposit.", "info");
      return;
    }
    setContributing(true);
    try {
      const res = await contribute(suggestion.suggested_amount, "suggested");
      showToast(
        res.data?.message ?? `MoMo prompt of ${fmt(suggestion.suggested_amount)} sent.`,
        "success"
      );
    } catch (e: any) {
      showToast(getUserFriendlyError(e), "error");
    } finally {
      setContributing(false);
    }
  };

  const handleLinkMomo = async () => {
    const cleaned = momoNumber.replace(/\s/g, "");
    if (!cleaned || cleaned.length < 10) {
      setMomoNumberError("Enter a valid 10-digit MoMo number.");
      return;
    }
    setLinking(true);
    try {
      await linkMomo({ momo_number: cleaned, momo_provider: momoProvider });
      showToast("MoMo account linked successfully.", "success");
      setShowLinkForm(false);
      setMomoNumber("");
    } catch (e: any) {
      showToast(getUserFriendlyError(e), "error");
    } finally {
      setLinking(false);
    }
  };

  const providerDisplay = (provider?: string) => {
    if (!provider) return "";
    return PROVIDERS.find((p) => p.value === provider)?.label ?? provider.toUpperCase();
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Savings Vault</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#C44736"]} tintColor="#C44736" />
        }
      >
        {loading ? (
          <ActivityIndicator size="large" color="#C44736" style={{ marginTop: 60 }} />
        ) : error ? (
          <ErrorState onRetry={refreshVault} />
        ) : (
          <>
            {/* ── Hero card ── */}
            <LinearGradient
              colors={["#C44736", "#8B2318"]}
              style={styles.heroCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {/* Decorative arcs */}
              <View style={styles.arcOuter} pointerEvents="none" />
              <View style={styles.arcInner} pointerEvents="none" />

              <View style={styles.heroTop}>
                <View style={styles.iconCircle}>
                  <Ionicons name="lock-closed-outline" size={22} color="#FFFFFF" />
                </View>
                <TouchableOpacity onPress={toggleAmountsHidden} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons
                    name={amountsHidden ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="rgba(255,255,255,0.7)"
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.heroLabel}>VAULT BALANCE</Text>
              <Text style={styles.heroAmount}>
                {amountsHidden ? "GH¢ ••••••" : fmt(vault?.balance ?? 0)}
              </Text>

              <View style={styles.heroFooter}>
                <Ionicons
                  name={vault?.momo_linked ? "checkmark-circle" : "ellipse-outline"}
                  size={14}
                  color={vault?.momo_linked ? "#86EFAC" : "rgba(255,255,255,0.5)"}
                />
                <Text style={styles.heroMomo}>
                  {vault?.momo_linked
                    ? `${providerDisplay(vault.linked_momo_provider)} · ${vault.linked_momo_number}`
                    : "No MoMo account linked"}
                </Text>
                <TouchableOpacity onPress={() => setShowLinkForm((v) => !v)}>
                  <Text style={styles.heroMomoAction}>
                    {vault?.momo_linked ? "Change" : "Link now"}
                  </Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>

            {/* ── Link MoMo form ── */}
            {showLinkForm && (
              <View style={styles.linkCard}>
                <Text style={styles.linkTitle}>
                  {vault?.momo_linked ? "Change MoMo Account" : "Link MoMo Account"}
                </Text>
                <Text style={styles.linkSubtitle}>
                  Your vault deposits will be collected from this number via MoMo prompt.
                </Text>

                <Text style={styles.fieldLabel}>PROVIDER</Text>
                <Dropdown
                  style={styles.providerDropdown}
                  selectedTextStyle={styles.dropdownText}
                  itemTextStyle={styles.dropdownText}
                  containerStyle={styles.dropdownContainer}
                  activeColor="#F2EDE8"
                  data={PROVIDERS}
                  labelField="label"
                  valueField="value"
                  value={momoProvider}
                  onChange={(item) => setMomoProvider(item.value as any)}
                />

                <Text style={[styles.fieldLabel, { marginTop: 14 }]}>MOMO NUMBER</Text>
                <TextInput
                  style={[styles.linkInput, momoNumberError ? styles.inputError : undefined]}
                  placeholder="e.g. 0241234567"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  value={momoNumber}
                  onChangeText={(t) => { setMomoNumber(t); if (momoNumberError) setMomoNumberError(""); }}
                />
                {momoNumberError ? <Text style={styles.fieldError}>{momoNumberError}</Text> : null}

                <View style={styles.linkActions}>
                  <TouchableOpacity
                    style={styles.linkCancelBtn}
                    onPress={() => { setShowLinkForm(false); setMomoNumber(""); setMomoNumberError(""); }}
                  >
                    <Text style={styles.linkCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.linkConfirmBtn, linking && { opacity: 0.6 }]}
                    onPress={handleLinkMomo}
                    disabled={linking}
                  >
                    <Text style={styles.linkConfirmText}>{linking ? "Linking…" : "Link Account"}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* ── Suggestion banner ── */}
            {suggestion && suggestion.suggested_amount > 0 && !showLinkForm && (
              <View style={styles.suggestionCard}>
                <View style={styles.suggestionLeft}>
                  <View style={styles.bulbCircle}>
                    <Ionicons name="bulb-outline" size={18} color="#D97706" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.suggestionTitle}>Suggested savings</Text>
                    <Text style={styles.suggestionText} numberOfLines={2}>
                      {suggestion.message ?? "Based on your income and tax liability."}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.saveNowBtn, contributing && { opacity: 0.6 }]}
                  onPress={handleSuggestedDeposit}
                  disabled={contributing}
                  activeOpacity={0.85}
                >
                  <Text style={styles.saveNowAmount}>
                    {amountsHidden ? "••••" : fmt(suggestion.suggested_amount)}
                  </Text>
                  <Text style={styles.saveNowLabel}>Save now</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── Deposit form ── */}
            {!showLinkForm && (
              <View style={styles.depositCard}>
                <Text style={styles.sectionLabel}>DEPOSIT TO VAULT</Text>
                <View style={[styles.amountRow, amountError ? styles.inputError : undefined]}>
                  <Text style={styles.amountPrefix}>GH¢</Text>
                  <TextInput
                    style={styles.amountInput}
                    placeholder="0.00"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="decimal-pad"
                    value={amount}
                    onChangeText={(t) => { setAmount(t); if (amountError) setAmountError(""); }}
                  />
                </View>
                {amountError ? <Text style={styles.fieldError}>{amountError}</Text> : null}

                <TouchableOpacity
                  style={[styles.depositBtn, contributing && { opacity: 0.6 }]}
                  onPress={handleDeposit}
                  disabled={contributing}
                  activeOpacity={0.85}
                >
                  <Ionicons name="phone-portrait-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.depositBtnText}>
                    {contributing ? "Sending MoMo prompt…" : "Deposit via MoMo"}
                  </Text>
                </TouchableOpacity>

                <Text style={styles.depositHint}>
                  A MoMo prompt will be sent to {vault?.momo_linked ? vault.linked_momo_number : "your linked number"}.
                  Approve it on your phone to complete the deposit.
                </Text>
              </View>
            )}

            {/* ── Activity ── */}
            <Text style={styles.sectionLabel}>VAULT ACTIVITY</Text>

            {transactions.length === 0 ? (
              <View style={styles.emptyCard}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons name="wallet-outline" size={28} color="#C44736" />
                </View>
                <Text style={styles.emptyTitle}>No activity yet</Text>
                <Text style={styles.emptyText}>
                  Make your first deposit to start saving towards your tax obligations.
                </Text>
              </View>
            ) : (
              transactions.map((item) => {
                const isCredit = item.type === "DEPOSIT";
                const statusCfg = STATUS_CONFIG[item.status?.toUpperCase()] ?? STATUS_CONFIG.PENDING;
                const triggerLabel = TRIGGER_LABELS[item.trigger?.toUpperCase()] ?? item.trigger;

                return (
                  <View key={item.vault_transaction_id} style={styles.activityItem}>
                    <View style={[styles.activityIcon, { backgroundColor: isCredit ? "#DCFCE7" : "#FEE2E2" }]}>
                      <Ionicons
                        name={isCredit ? "arrow-down" : "arrow-up"}
                        size={16}
                        color={isCredit ? "#16A34A" : "#DC2626"}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.activityTitle}>
                        {isCredit ? "Deposit" : "Withdrawal"} · {triggerLabel}
                      </Text>
                      <Text style={styles.activityDate}>
                        {new Date(item.created_at).toLocaleDateString("en-GH", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </Text>
                    </View>
                    <View style={{ alignItems: "flex-end", gap: 4 }}>
                      <Text style={[styles.activityAmount, { color: isCredit ? "#16A34A" : "#DC2626" }]}>
                        {amountsHidden ? "••••••" : `${isCredit ? "+" : "-"}${fmt(item.amount)}`}
                      </Text>
                      <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
                        <Text style={[styles.statusBadgeText, { color: statusCfg.color }]}>
                          {statusCfg.label}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </>
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

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },

  title: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#111827",
  },

  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 48,
  },

  // ── Hero ──
  heroCard: {
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 24,
    marginBottom: 16,
    overflow: "hidden",
  },

  arcOuter: {
    position: "absolute",
    top: -60,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.1)",
  },

  arcInner: {
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
    marginBottom: 20,
  },

  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },

  heroLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    letterSpacing: 1.2,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 6,
  },

  heroAmount: {
    color: "#FFFFFF",
    fontSize: 34,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
    marginBottom: 20,
  },

  heroFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.15)",
  },

  heroMomo: {
    flex: 1,
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },

  heroMomoAction: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    textDecorationLine: "underline",
  },

  // ── Link MoMo ──
  linkCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  linkTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    marginBottom: 4,
  },

  linkSubtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 20,
  },

  fieldLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "#C44736",
    letterSpacing: 0.8,
    marginBottom: 8,
  },

  providerDropdown: {
    backgroundColor: "#F2EDE8",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 4,
    height: 50,
  },

  dropdownText: {
    color: "#111827",
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },

  dropdownContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  linkInput: {
    backgroundColor: "#F2EDE8",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontFamily: "Inter_400Regular",
    color: "#111827",
    fontSize: 15,
    borderWidth: 1.5,
    borderColor: "transparent",
  },

  linkActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },

  linkCancelBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },

  linkCancelText: {
    color: "#6B7280",
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },

  linkConfirmBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#C44736",
    shadowColor: "#C44736",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  linkConfirmText: {
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },

  // ── Suggestion ──
  suggestionCard: {
    backgroundColor: "#FFFBEB",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FDE68A",
    gap: 12,
  },

  suggestionLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  bulbCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
  },

  suggestionTitle: {
    fontFamily: "Inter_600SemiBold",
    color: "#111827",
    fontSize: 14,
    marginBottom: 2,
  },

  suggestionText: {
    color: "#6B7280",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },

  saveNowBtn: {
    backgroundColor: "#D97706",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: "center",
    minWidth: 90,
  },

  saveNowAmount: {
    color: "#FFFFFF",
    fontFamily: "Inter_700Bold",
    fontSize: 13,
  },

  saveNowLabel: {
    color: "rgba(255,255,255,0.8)",
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    marginTop: 2,
  },

  // ── Deposit ──
  depositCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "#C44736",
    letterSpacing: 0.8,
    marginBottom: 12,
  },

  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2EDE8",
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: "transparent",
  },

  amountPrefix: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#9CA3AF",
    marginRight: 8,
  },

  amountInput: {
    flex: 1,
    paddingVertical: 16,
    fontFamily: "Inter_400Regular",
    color: "#111827",
    fontSize: 22,
  },

  depositBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#C44736",
    borderRadius: 14,
    paddingVertical: 16,
    marginBottom: 12,
    shadowColor: "#C44736",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  depositBtnText: {
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },

  depositHint: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 18,
  },

  inputError: {
    borderColor: "#EF4444",
  },

  fieldError: {
    color: "#EF4444",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginBottom: 8,
  },

  // ── Activity ──
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
  },

  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#FDECEC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
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
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },

  activityItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  activityTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#111827",
    marginBottom: 3,
  },

  activityDate: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
  },

  activityAmount: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
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
});
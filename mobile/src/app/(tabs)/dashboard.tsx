import React, { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { useUser } from "../../context/UserContext";
import { useNotifications } from "../../context/NotificationContext";
import { useDeadlines } from "../../context/DeadlineContext";
import { usePrivacy } from "../../context/PrivacyContext";
import Card from "../../components/Card";
import { useTaxLiability } from "@/context/TaxLiabilityContext";
import { useSavings } from "@/context/SavingsContext";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { getTaxProfile } from "@/services/tax-profile.service";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  }).format(value);

export default function HomeScreen() {
  const { user } = useUser();
  const { unreadCount } = useNotifications();
  const { deadlines } = useDeadlines();
  const { amountsHidden, toggleAmountsHidden } = usePrivacy();

  const { liability, recalculate } = useTaxLiability();
  const { suggestion } = useSavings();
  const [recalculating, setRecalculating] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);

  useFocusEffect(
    useCallback(() => {
      getTaxProfile()
        .then((res) => setOnboardingComplete(res.data?.onboarding_complete ?? false))
        .catch(() => setOnboardingComplete(null));
    }, [])
  );

  const taxableIncome = liability?.taxable_income ?? 0;
  const totalDeductions = liability?.total_deductions ?? 0;
  const taxLiability = liability?.tax_liability ?? 0;
  const totalAmountPaid = liability?.total_amount_paid ?? 0;
  const netLiability = liability?.net_liability ?? 0;

  const handleRecalculate = async () => {
    if (recalculating) return;
    setRecalculating(true);
    try {
      await recalculate();
    } catch {
    } finally {
      setRecalculating(false);
    }
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const calculateDaysLeft = (dueDate: string) => {
    const today = new Date();
    const difference = new Date(dueDate).getTime() - today.getTime();
    return Math.ceil(difference / (1000 * 60 * 60 * 24));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 80 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            {new Date().getHours() < 12
              ? "Good morning"
              : new Date().getHours() < 17
              ? "Good afternoon"
              : "Good evening"}, {user?.fullName?.split(" ")[0] || "User"}
          </Text>
          <Text style={styles.date}>{currentDate}</Text>
        </View>

        {/* Floating notification button */}
        <TouchableOpacity
          style={styles.notificationContainer}
          onPress={() => router.push("/notifications")}
        >
          <Ionicons name="notifications-outline" size={28} color="#111827" />
          {unreadCount > 0 && (
            <View style={styles.notificationDot}>
              <Text style={styles.notificationCount}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Onboarding banner — persists until profile is complete */}
      {onboardingComplete === false && (
        <TouchableOpacity
          style={styles.onboardingBanner}
          onPress={() => router.push("/taxpayer-profile")}
          activeOpacity={0.85}
        >
          <View style={styles.onboardingLeft}>
            <View style={styles.onboardingIconBox}>
              <Ionicons name="person-outline" size={18} color="#C44736" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.onboardingTitle}>Complete your tax profile</Text>
              <Text style={styles.onboardingText}>
                Add your TIN and tax year start to activate deadlines and full features.
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#C44736" />
        </TouchableOpacity>
      )}

      {/* Net Tax Liability Card */}
      <LinearGradient
        colors={["#C44736", "#8B2318"]}
        style={styles.taxCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.taxArcOuter} pointerEvents="none" />
        <View style={styles.taxArcInner} pointerEvents="none" />

        <View style={styles.taxCardTop}>
          <View style={styles.taxIconBox}>
            <Ionicons name="cash-outline" size={20} color="#FFFFFF" />
          </View>
          <TouchableOpacity onPress={toggleAmountsHidden} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons
              name={amountsHidden ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="rgba(255,255,255,0.7)"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.taxLabelRow}>
          <Text style={styles.taxLabel}>NET TAX LIABILITY</Text>
          <TouchableOpacity
            style={styles.recalcBtn}
            onPress={handleRecalculate}
            disabled={recalculating}
            activeOpacity={0.75}
          >
            <Ionicons
              name={recalculating ? "refresh" : "refresh-outline"}
              size={13}
              color="rgba(255,255,255,0.85)"
            />
            <Text style={styles.recalcBtnText}>
              {recalculating ? "Updating…" : "Recalculate"}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.taxAmount}>
          {amountsHidden ? "GHS ••••••" : formatCurrency(Math.max(netLiability, 0))}
        </Text>
      </LinearGradient>

      {/* Summary Cards */}
      <View style={styles.grid}>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Taxable Income</Text>
          <Text style={styles.summaryAmount}>
            {amountsHidden ? "••••••" : formatCurrency(taxableIncome)}
          </Text>
          <Text style={styles.summaryCaption}>This month</Text>
        </Card>

        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Total Deductions</Text>
          <Text style={styles.summaryAmount}>
            {amountsHidden ? "••••••" : formatCurrency(totalDeductions)}
          </Text>
          <Text style={styles.summaryCaption}>This month</Text>
        </Card>

        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Total Tax Liability</Text>
          <Text style={styles.summaryAmount}>
            {amountsHidden ? "••••••" : formatCurrency(taxLiability)}
          </Text>
          <Text style={styles.summaryCaption}>This month</Text>
        </Card>

        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Tax Paid</Text>
          <Text style={styles.summaryAmount}>
            {amountsHidden ? "••••••" : formatCurrency(totalAmountPaid)}
          </Text>
          <Text style={styles.summaryCaption}>This month</Text>
        </Card>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickGrid}>
        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => router.push("/add-transaction")}
        >
          <Ionicons name="add-circle-outline" size={24} color="#C44736" />
          <Text style={styles.quickTitle}>Log Transaction</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => router.push("/payments")}
        >
          <Ionicons name="card-outline" size={24} color="#C44736" />
          <Text style={styles.quickTitle}>Pay Tax</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => router.push("/create-invoice")}
        >
          <Ionicons name="receipt-outline" size={24} color="#C44736" />
          <Text style={styles.quickTitle}>Create Invoice</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => router.push("/compliance-certificate")}
        >
          <Ionicons name="shield-checkmark-outline" size={24} color="#C44736" />
          <Text style={styles.quickTitle}>Tax Compliance</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => router.push("/tax-returns")}
        >
          <Ionicons name="document-text-outline" size={24} color="#C44736" />
          <Text style={styles.quickTitle}>File Tax Return</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => router.push("/tax-rates")}
        >
          <Ionicons name="calculator-outline" size={24} color="#C44736" />
          <Text style={styles.quickTitle}>Tax Rates</Text>
        </TouchableOpacity>
      </View>

      {/* Savings Suggestion */}
      {suggestion && suggestion.suggested_amount > 0 && (
        <TouchableOpacity
          style={styles.suggestionCard}
          onPress={() => router.push("/savings-vault")}
          activeOpacity={0.85}
        >
          <View style={styles.suggestionLeft}>
            <View style={styles.bulbCircle}>
              <Ionicons name="bulb-outline" size={18} color="#D97706" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.suggestionTitle}>Savings suggestion</Text>
              <Text style={styles.suggestionText} numberOfLines={2}>
                {suggestion.message ?? "Based on your income and tax liability."}
              </Text>
            </View>
          </View>
          <View style={styles.saveNowBtn}>
            <Text style={styles.saveNowLabel}>Save now →</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Deadlines Header */}
      <View style={styles.deadlineHeader}>
        <Text style={styles.sectionTitle}>Upcoming Deadlines</Text>
        <TouchableOpacity onPress={() => router.push("/deadlines")}>
          <Text style={styles.seeAll}>See all →</Text>
        </TouchableOpacity>
      </View>

      {deadlines.map((deadline) => {
        const daysLeft = calculateDaysLeft(deadline.dueDate);

        return (
          <Card key={deadline.id} style={styles.deadlineCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.deadlineTitle}>{deadline.title}</Text>
              <Text style={styles.deadlineAuthority}>
                {deadline.authority}
              </Text>
              <Text style={styles.deadlineDate}>
                {new Date(deadline.dueDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </Text>
            </View>

            <Text
              style={[
                styles.deadlineStatus,
                {
                  color:
                    daysLeft >= 0
                      ? "#16A34A"
                      : "#C44736",
                },
              ]}
            >
              {daysLeft >= 0
                ? `${daysLeft} days left`
                : "Overdue"}
            </Text>
          </Card>
        );
      })}
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F2EDE8",
  },

  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  header: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  notificationContainer: {
    position: "relative",
    padding: 4,
  },

  notificationDot: {
    position: "absolute",
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#C44736",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 3,
  },

  notificationCount: {
    color: "#FFFFFF",
    fontSize: 9,
    fontFamily: "Inter_700Bold",
  },

  greeting: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: "#111827",
  },

  date: {
    marginTop: 2,
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "Inter_400Regular",
  },

  taxCard: {
    borderRadius: 24,
    paddingTop: 24,
    paddingBottom: 28,
    paddingHorizontal: 24,
    marginBottom: 20,
    overflow: "hidden",
    shadowColor: "#8B2318",
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },

  taxArcOuter: {
    position: "absolute",
    top: -60,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.1)",
  },

  taxArcInner: {
    position: "absolute",
    top: -20,
    right: -20,
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.07)",
  },

  taxCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  taxIconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },

  taxLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  taxLabel: {
    color: "rgba(255,255,255,0.6)",
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 1.2,
  },

  taxAmount: {
    color: "#FFFFFF",
    fontFamily: "Inter_700Bold",
    fontSize: 34,
    letterSpacing: -0.5,
    marginBottom: 0,
  },

  recalcBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  recalcBtnText: {
    color: "rgba(255,255,255,0.85)",
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  summaryCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },

  summaryTitle: {
    color: "#6B7280",
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    marginBottom: 6,
  },

  summaryAmount: {
    fontSize: 18,
    color: "#111827",
    fontFamily: "Inter_700Bold",
  },

  summaryCaption: {
    marginTop: 4,
    fontSize: 10,
    color: "#9CA3AF",
    fontFamily: "Inter_400Regular",
  },

  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  quickCard: {
    width: "31%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    alignItems: "center",
    paddingVertical: 14,
    marginBottom: 10,
  },

  quickTitle: {
    marginTop: 6,
    color: "#111827",
    fontFamily: "Inter_500Medium",
    textAlign: "center",
    fontSize: 12,
  },

  suggestionCard: {
    backgroundColor: "#FFFBEB",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
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
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  saveNowLabel: {
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },

  deadlineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 0,
  },

  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#C44736",
    marginBottom: 10,
  },

  seeAll: {
    color: "#111827",
    fontFamily: "Inter_600SemiBold",
  },

  deadlineCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  deadlineTitle: {
    fontFamily: "Inter_600SemiBold",
    color: "#111827",
    fontSize: 14,
  },

  deadlineAuthority: {
    marginTop: 2,
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "Inter_500Medium",
  },

  deadlineDate: {
    marginTop: 2,
    fontSize: 11,
    color: "#9CA3AF",
    fontFamily: "Inter_400Regular",
  },

  deadlineStatus: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },

  onboardingBanner: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: "#F8C5BF",
    gap: 10,
  },

  onboardingLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  onboardingIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#FDECEC",
    justifyContent: "center",
    alignItems: "center",
  },

  onboardingTitle: {
    fontFamily: "Inter_600SemiBold",
    color: "#111827",
    fontSize: 14,
    marginBottom: 2,
  },

  onboardingText: {
    color: "#6B7280",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 17,
  },
});
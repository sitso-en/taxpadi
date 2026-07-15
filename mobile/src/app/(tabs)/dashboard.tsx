import React, { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import { useTransactions } from "../../context/TransactionContext";
import { usePayments } from "../../context/PaymentContext";
import { useNotifications } from "../../context/NotificationContext";
import { useDeadlines } from "../../context/DeadlineContext";
import Card from "../../components/Card";
import { getTaxLiability } from "@/services/tax.service";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  }).format(value);

export default function HomeScreen() {
  const { user } = useUser();
  const { transactions } = useTransactions();
  const { payments } = usePayments();
  const { unreadCount } = useNotifications();
  const { deadlines } = useDeadlines();

  const [hideAmounts, setHideAmounts] = useState(false);

  const [taxableIncome, setTaxableIncome] = useState(0);
  const [totalDeductions, setTotalDeductions] = useState(0);
  const [taxLiability, setTaxLiability] = useState(0);
  const [totalAmountPaid, setTotalAmountPaid] = useState(0);
  const [netLiability, setNetLiability] = useState(0);

  useEffect(() => {
    const loadLiability = async () => {
      try {
        const response = await getTaxLiability();
        const data = response.data ?? response;

        setTaxableIncome(data.taxable_income ?? 0);
        setTotalDeductions(data.total_deductions ?? 0);
        setTaxLiability(data.tax_liability ?? 0);
        setTotalAmountPaid(data.total_amount_paid ?? 0);
        setNetLiability(data.net_liability ?? 0);
      } catch (error) {
        console.log("Failed to load tax liability:", error);
      }
    };

    loadLiability();
  }, [transactions]);

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
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
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
          onPress={() => router.push("/notification-preferences")}
        >
          <Ionicons name="notifications-outline" size={22} color="#111827" />
          {unreadCount > 0 && (
            <View style={styles.notificationDot}>
              <Text style={styles.notificationCount}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Net Tax Liability Card */}
      <View style={styles.taxCard}>
        <View style={styles.taxCircle}>
          <Ionicons name="cash-outline" size={34} color="#FFFFFF" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.taxLabel}>NET TAX LIABILITY</Text>
          <Text style={styles.taxAmount}>
            {hideAmounts
              ? "••••••"
              : formatCurrency(Math.max(netLiability, 0))}
          </Text>
          <TouchableOpacity
            onPress={() => setHideAmounts(!hideAmounts)}
            style={styles.visibilityButton}
          >
            <Ionicons
              name={hideAmounts ? "eye-off-outline" : "eye-outline"}
              size={18}
              color="#FFFFFF"
            />
            <Text style={styles.visibilityText}>
              {hideAmounts ? "Show" : "Hide"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Summary Cards */}
      <View style={styles.grid}>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Taxable Income</Text>
          <Text style={styles.summaryAmount}>
            {hideAmounts ? "••••••" : formatCurrency(taxableIncome)}
          </Text>
          <Text style={styles.summaryCaption}>This month</Text>
        </Card>

        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Total Deductions</Text>
          <Text style={styles.summaryAmount}>
            {hideAmounts ? "••••••" : formatCurrency(totalDeductions)}
          </Text>
          <Text style={styles.summaryCaption}>This month</Text>
        </Card>

        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Total Tax Liability</Text>
          <Text style={styles.summaryAmount}>
            {hideAmounts ? "••••••" : formatCurrency(taxLiability)}
          </Text>
          <Text style={styles.summaryCaption}>This month</Text>
        </Card>

        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Tax Paid</Text>
          <Text style={styles.summaryAmount}>
            {hideAmounts ? "••••••" : formatCurrency(totalAmountPaid)}
          </Text>
          <Text style={styles.summaryCaption}>This month</Text>
        </Card>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickGrid}>
        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => router.push("//(tabs)/add-transaction")}
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
          onPress={() => router.push("//(tabs)/create-invoice")}
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
          onPress={() => router.push("/tax")}
        >
          <Ionicons name="calculator-outline" size={24} color="#C44736" />
          <Text style={styles.quickTitle}>Tax Rates</Text>
        </TouchableOpacity>
      </View>

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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 16,
    paddingTop: 44,
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
    width: 44,
    height: 44,
    borderRadius: 26,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 3,
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
    fontSize: 16,
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
    backgroundColor: "#C44736",
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 7,
  },

  taxCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  taxLabel: {
    color: "#FDECEC",
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
    letterSpacing: 0.5,
  },

  taxAmount: {
    color: "#FFFFFF",
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    marginTop: 2,
  },

  visibilityButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },

  visibilityText: {
    color: "#FFFFFF",
    marginLeft: 6,
    fontFamily: "Inter_500Medium",
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

  deadlineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
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
});
import React, { useState } from "react";
import { useUser } from "../../context/UserContext";
import { useTransactions } from "../../context/TransactionContext";
import { usePayments } from "../../context/PaymentContext";
import { useNotifications } from "../../context/NotificationContext";
import { useDeadlines } from "../../context/DeadlineContext";
import Card from "../../components/Card";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const { user } = useUser();
  const { transactions } = useTransactions();
  const { payments } = usePayments();
  const { unreadCount } = useNotifications();
  const { deadlines } = useDeadlines();

  const [hideAmounts, setHideAmounts] = useState(false);

  const firstName = user?.fullName?.split(" ")[0] || "User";

  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? "Good morning"
      : hour < 17
      ? "Good afternoon"
      : "Good evening";

  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const deductibleExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const taxableProfit = totalIncome - deductibleExpenses;

  const totalPayments = payments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );

  const vatDue = totalIncome * 0.15;
  const payeDue = totalIncome * 0.055;
  const incomeTax = taxableProfit > 0 ? taxableProfit * 0.25 : 0;
  const withholdingTax = totalIncome * 0.05;

  const totalTaxLiability = vatDue + payeDue + incomeTax + withholdingTax;
  const netTaxLiability = totalTaxLiability - totalPayments;

  const calculateDaysLeft = (dueDate: string) => {
    const today = new Date();
    const difference = new Date(dueDate).getTime() - today.getTime();
    return Math.ceil(difference / (1000 * 60 * 60 * 24));
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting}, {firstName} 👋</Text>
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
              : `GH¢ ${Math.max(netTaxLiability, 0).toFixed(2)}`}
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
          <Text style={styles.summaryTitle}>Income</Text>
          <Text style={styles.summaryAmount}>
            {hideAmounts ? "••••••" : `GH¢ ${totalIncome.toFixed(2)}`}
          </Text>
          <Text style={styles.summaryCaption}>This month</Text>
        </Card>

        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Expenses</Text>
          <Text style={styles.summaryAmount}>
            {hideAmounts ? "••••••" : `GH¢ ${totalExpenses.toFixed(2)}`}
          </Text>
          <Text style={styles.summaryCaption}>This month</Text>
        </Card>

        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Total Tax Liability</Text>
          <Text style={styles.summaryAmount}>
            {hideAmounts ? "••••••" : `GH¢ ${totalTaxLiability.toFixed(2)}`}
          </Text>
          <Text style={styles.summaryCaption}>This month</Text>
        </Card>

        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Tax Paid</Text>
          <Text style={styles.summaryAmount}>
            {hideAmounts ? "••••••" : `GH¢ ${totalPayments.toFixed(2)}`}
          </Text>
          <Text style={styles.summaryCaption}>This month</Text>
        </Card>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickGrid}>
        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => router.push("/transactions")}
        >
          <Ionicons name="swap-horizontal-outline" size={24} color="#C44736" />
          <Text style={styles.quickTitle}>Transactions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => router.push("/payments")}
        >
          <Ionicons name="card-outline" size={24} color="#C44736" />
          <Text style={styles.quickTitle}>Payments</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => router.push("/invoices")}
        >
          <Ionicons name="receipt-outline" size={24} color="#C44736" />
          <Text style={styles.quickTitle}>Invoices</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => router.push("/tax-returns")}
        >
          <Ionicons name="document-text-outline" size={24} color="#C44736" />
          <Text style={styles.quickTitle}>Returns</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => router.push("/reports")}
        >
          <Ionicons name="bar-chart-outline" size={24} color="#C44736" />
          <Text style={styles.quickTitle}>Reports</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => router.push("/deadlines")}
        >
          <Ionicons name="calendar-outline" size={24} color="#C44736" />
          <Text style={styles.quickTitle}>Deadlines</Text>
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

            {daysLeft >= 0 ? (
              <Text style={styles.daysLeft}>{daysLeft} days left</Text>
            ) : (
              <View style={styles.overdueBadge}>
                <Text style={styles.overdueText}>Overdue</Text>
              </View>
            )}
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
    paddingHorizontal: 20,
    paddingTop: 55,
  },

  header: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },

  notificationContainer: {
    position: "relative",
    width: 52,
    height: 52,
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
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: "#111827",
  },

  date: {
    marginTop: 4,
    color: "#6B7280",
    fontFamily: "Inter_400Regular",
  },

  taxCard: {
    backgroundColor: "#C44736",
    borderRadius: 24,
    paddingVertical: 34,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
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
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 18,
  },

  taxLabel: {
    color: "#FDECEC",
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    letterSpacing: 0.5,
  },

  taxAmount: {
    color: "#FFFFFF",
    fontFamily: "Inter_700Bold",
    fontSize: 30,
    marginTop: 4,
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
    marginBottom: 32,
  },

  summaryCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,
    marginBottom: 12,
  },

  summaryTitle: {
    color: "#6B7280",
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    marginBottom: 8,
  },

  summaryAmount: {
    fontSize: 22,
    color: "#111827",
    fontFamily: "Inter_700Bold",
  },

  summaryCaption: {
    marginTop: 6,
    fontSize: 12,
    color: "#9CA3AF",
    fontFamily: "Inter_400Regular",
  },

  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 32,
  },

  quickCard: {
    width: "31%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    alignItems: "center",
    paddingVertical: 20,
    marginBottom: 14,
  },

  quickTitle: {
    marginTop: 10,
    color: "#111827",
    fontFamily: "Inter_500Medium",
    textAlign: "center",
  },

  deadlineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    marginBottom: 16,
  },

  seeAll: {
    color: "#C44736",
    fontFamily: "Inter_600SemiBold",
  },

  deadlineCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  deadlineTitle: {
    fontFamily: "Inter_600SemiBold",
    color: "#111827",
    fontSize: 16,
  },

  deadlineAuthority: {
    marginTop: 4,
    fontSize: 13,
    color: "#6B7280",
    fontFamily: "Inter_500Medium",
  },

  deadlineDate: {
    marginTop: 2,
    fontSize: 12,
    color: "#9CA3AF",
    fontFamily: "Inter_400Regular",
  },

  daysLeft: {
    backgroundColor: "#FCE8E6",
    color: "#C44736",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    overflow: "hidden",
  },

  overdueBadge: {
    backgroundColor: "#C44736",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },

  overdueText: {
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
});
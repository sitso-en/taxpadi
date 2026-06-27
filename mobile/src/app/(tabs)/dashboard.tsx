import { useUser } from "../../context/UserContext";
import { useTransactions } from "../../context/TransactionContext";
import { usePayments } from "../../context/PaymentContext";
import { useNotifications } from "../../context/NotificationContext";
import { useDeadlines } from "../../context/DeadlineContext";

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

  const firstName =
    user.fullName?.split(" ")[0] || "User";

  const currentDate = new Date().toLocaleDateString(
    "en-US",
    {
      month: "long",
      year: "numeric",
    }
  );

  // Financial calculations

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  // Only deductible expenses reduce taxes
  const deductibleExpenses = transactions
    .filter(
      (t) =>
        t.type === "expense" &&
        t.isDeductible
    )
    .reduce((sum, t) => sum + t.amount, 0);

  // Taxable profit after deductions
   const taxableProfit = totalIncome - deductibleExpenses; const totalPayments = payments.reduce( (sum, payment) => sum + payment.amount, 0 );
    // Taxes 
    const vatDue = totalIncome * 0.15; const payeDue = totalIncome * 0.055; const incomeTax = taxableProfit > 0 ? taxableProfit * 0.25 : 0; const withholdingTax = totalIncome * 0.05; 
    // Total tax liability 
  const totalTaxLiability = vatDue + payeDue + incomeTax + withholdingTax;
   // Actual amount left to pay
    const netTaxLiability = totalTaxLiability - totalPayments;
  const calculateDaysLeft = (
    dueDate: string
  ) => {
    const today = new Date();

    const difference =
      new Date(dueDate).getTime() -
      today.getTime();

    return Math.ceil(
      difference / (1000 * 60 * 60 * 24)
    );
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
          <Text style={styles.greeting}>
            Good morning, {firstName} 👋
          </Text>

          <Text style={styles.date}>
            {currentDate}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.notificationContainer}
          onPress={() =>
            router.push(
              "/notification-preferences"
            )
          }
        >
          <Ionicons
            name="notifications-outline"
            size={26}
            color="#111827"
          />

          {unreadCount > 0 && (
            <View
              style={styles.notificationDot}
            >
              <Text
                style={
                  styles.notificationCount
                }
              >
                {unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Net Tax Liability Card */}

      <View style={styles.taxCard}>
        <View style={styles.taxCircle}>
          <View
            style={styles.taxCircleInner}
          />
        </View>

        <View>
          <Text style={styles.taxLabel}>
            NET TAX LIABILITY
          </Text>

          <Text style={styles.taxAmount}>
            GH¢{" "}
            {Math.max(
              netTaxLiability,
              0
            ).toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Summary Grid */}

      <View style={styles.grid}>
        <View style={styles.summaryCard}>
          <Text
            style={styles.summaryTitle}
          >
            Income
          </Text>

          <Text
            style={styles.summaryAmount}
          >
            GH¢ {totalIncome.toFixed(2)}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text
            style={styles.summaryTitle}
          >
            Expenses
          </Text>

          <Text
            style={styles.summaryAmount}
          >
            GH¢ {totalExpenses.toFixed(2)}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text
            style={styles.summaryTitle}
          >
            Total Tax Liability
          </Text>

          <Text
            style={styles.summaryAmount}
          >
            GH¢{" "}
            {totalTaxLiability.toFixed(2)}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text
            style={styles.summaryTitle}
          >
            Tax Paid
          </Text>

          <Text
            style={styles.summaryAmount}
          >
            GH¢ {totalPayments.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Deadlines */}

      <View style={styles.deadlineHeader}>
        <Text style={styles.sectionTitle}>
          Upcoming Deadlines
        </Text>

        <TouchableOpacity
          onPress={() =>
            router.push("/deadlines")
          }
        >
          <Text style={styles.seeAll}>
            See all →
          </Text>
        </TouchableOpacity>
      </View>

      {deadlines.map((deadline) => {
        const daysLeft =
          calculateDaysLeft(
            deadline.dueDate
          );

        return (
          <View
            key={deadline.id}
            style={styles.deadlineCard}
          >
            <View>
              <Text
                style={
                  styles.deadlineTitle
                }
              >
                {deadline.title}
              </Text>

              <Text
                style={
                  styles.deadlineDate
                }
              >
                {new Date(
                  deadline.dueDate
                ).toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    day: "numeric",
                  }
                )}
              </Text>
            </View>

            {daysLeft >= 0 ? (
              <Text
                style={styles.daysLeft}
              >
                {daysLeft}d left
              </Text>
            ) : (
              <View
                style={
                  styles.overdueBadge
                }
              >
                <Text
                  style={
                    styles.overdueText
                  }
                >
                  Overdue
                </Text>
              </View>
            )}
          </View>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },

  notificationContainer: {
    position: "relative",
    padding: 6,
  },

  notificationDot: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#C44736",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },

  notificationCount: {
    color: "#FFFFFF",
    fontSize: 10,
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
    borderRadius: 18,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
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

  taxCircleInner: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
  },

  taxLabel: {
    color: "#FDECEC",
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },

  taxAmount: {
    color: "#FFFFFF",
    fontFamily: "Inter_700Bold",
    fontSize: 30,
    marginTop: 4,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },

  summaryCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
  },

  summaryTitle: {
    color: "#6B7280",
    fontFamily: "Inter_500Medium",
    marginBottom: 8,
  },

  summaryAmount: {
    fontSize: 22,
    color: "#111827",
    fontFamily: "Inter_700Bold",
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
  },

  seeAll: {
    color: "#C44736",
    fontFamily: "Inter_600SemiBold",
  },

  deadlineCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
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

  deadlineDate: {
    color: "#6B7280",
    marginTop: 4,
    fontFamily: "Inter_400Regular",
  },

  daysLeft: {
    color: "#C44736",
    fontFamily: "Inter_600SemiBold",
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
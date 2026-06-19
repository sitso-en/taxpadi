import { Ionicons } from "@expo/vector-icons";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { usePayments } from "../context/PaymentContext";
import { useReturns } from "../context/ReturnContext";
import { useTransactions } from "../context/TransactionContext";

export default function ReportsScreen() {
  const { transactions } = useTransactions();
  const { payments } = usePayments();
  const { returns } = useReturns();

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const netPosition = totalIncome - totalExpenses;

  const incomeByCategory: Record<string, number> = {};
  const expenseByCategory: Record<string, number> = {};

  transactions.forEach((transaction) => {
    if (transaction.type === "income") {
      incomeByCategory[transaction.category] =
        (incomeByCategory[transaction.category] || 0) + transaction.amount;
    } else {
      expenseByCategory[transaction.category] =
        (expenseByCategory[transaction.category] || 0) + transaction.amount;
    }
  });

  const topIncomeCategory = Object.entries(incomeByCategory).sort(
    (a, b) => b[1] - a[1],
  )[0];

  const topExpenseCategory = Object.entries(expenseByCategory).sort(
    (a, b) => b[1] - a[1],
  )[0];

  const handleExport = () => {
    const report = `
TAXPADI REPORT

Total Transactions: ${transactions.length}

Total Income: GHS ${totalIncome.toFixed(2)}

Total Expenses: GHS ${totalExpenses.toFixed(2)}

Net Position: GHS ${netPosition.toFixed(2)}
`;

    alert(report);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <Text style={styles.title}>Reports</Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Net Position</Text>

        <Text
          style={[
            styles.summaryAmount,
            {
              color: netPosition >= 0 ? "#2E7D32" : "#C44736",
            },
          ]}
        >
          GHS {netPosition.toFixed(2)}
        </Text>

        <Text style={styles.summarySubtext}>Overall financial performance</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons
            name="arrow-down-circle-outline"
            size={24}
            color="#2E7D32"
          />

          <Text style={styles.statValue}>GHS {totalIncome.toFixed(2)}</Text>

          <Text style={styles.statLabel}>Income</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="arrow-up-circle-outline" size={24} color="#C44736" />

          <Text style={styles.statValue}>GHS {totalExpenses.toFixed(2)}</Text>

          <Text style={styles.statLabel}>Expenses</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Quick Statistics</Text>

        <Text>Transactions: {transactions.length}</Text>

        <Text>
          Returns Filed: {returns.filter((r) => r.status === "Filed").length}
        </Text>

        <Text>Payments Recorded: {payments.length}</Text>

        <Text
          style={{
            marginTop: 10,
            fontWeight: "600",
            color: returns.some((r) => r.status === "Pending")
              ? "#E65100"
              : "#2E7D32",
          }}
        >
          {returns.some((r) => r.status === "Pending")
            ? "Action Required"
            : "Good Standing"}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Income by Category</Text>

        {Object.entries(incomeByCategory).length === 0 ? (
          <Text>No income recorded</Text>
        ) : (
          Object.entries(incomeByCategory).map(([category, amount]) => (
            <Text key={category}>
              {category}: GHS {amount.toFixed(2)}
            </Text>
          ))
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Expenses by Category</Text>

        {Object.entries(expenseByCategory).length === 0 ? (
          <Text>No expenses recorded</Text>
        ) : (
          Object.entries(expenseByCategory).map(([category, amount]) => (
            <Text key={category}>
              {category}: GHS {amount.toFixed(2)}
            </Text>
          ))
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Top Categories</Text>

        <Text>Highest Income:</Text>

        <Text style={styles.highlight}>
          {topIncomeCategory
            ? `${topIncomeCategory[0]} - GHS ${topIncomeCategory[1].toFixed(2)}`
            : "No income recorded"}
        </Text>

        <Text
          style={{
            marginTop: 12,
          }}
        >
          Highest Expense:
        </Text>

        <Text style={styles.highlight}>
          {topExpenseCategory
            ? `${topExpenseCategory[0]} - GHS ${topExpenseCategory[1].toFixed(2)}`
            : "No expenses recorded"}
        </Text>
      </View>

      <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
        <View style={styles.exportRow}>
          <Ionicons name="download-outline" size={18} color="#FFFFFF" />

          <Text style={styles.exportButtonText}>Export Summary</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    padding: 20,
    paddingTop: 50,
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
  },

  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
  },

  summaryLabel: {
    color: "#666",
  },

  summaryAmount: {
    fontSize: 30,
    fontWeight: "bold",
    marginTop: 8,
  },

  summarySubtext: {
    color: "#666",
    marginTop: 6,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  statCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
  },

  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 8,
  },

  statLabel: {
    color: "#666",
    marginTop: 4,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },

  highlight: {
    color: "#C44736",
    fontWeight: "bold",
  },

  exportButton: {
    backgroundColor: "#C44736",
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
  },

  exportRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  exportButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    marginLeft: 8,
  },
});

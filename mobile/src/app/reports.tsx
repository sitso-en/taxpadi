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
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 30 }}
    >
      <Text style={styles.title}>Reports & Export</Text>

      <View style={styles.card}>
        <Text style={styles.reportTitle}>Total Transactions</Text>
        <Text>{transactions.length}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.reportTitle}>Total Income</Text>
        <Text>GHS {totalIncome.toFixed(2)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.reportTitle}>Total Expenses</Text>
        <Text>GHS {totalExpenses.toFixed(2)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.reportTitle}>Net Position</Text>
        <Text
          style={{
            color: netPosition >= 0 ? "green" : "red",
            fontWeight: "bold",
          }}
        >
          GHS {netPosition.toFixed(2)}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.reportTitle}>Tax Returns Filed</Text>
        <Text>{returns.filter((r) => r.status === "Filed").length}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.reportTitle}>Outstanding Payments</Text>
        <Text>
          GHS{" "}
          {payments
            .reduce((sum, payment) => sum + payment.amount, 0)
            .toFixed(2)}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.reportTitle}>Compliance Status</Text>
        <Text>
          {returns.some((r) => r.status === "Pending")
            ? "🟡 Action Required"
            : "🟢 Good Standing"}
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.reportTitle}>Income by Category</Text>

        {Object.entries(incomeByCategory).map(([category, amount]) => (
          <Text key={category}>
            {category}: GHS {amount.toFixed(2)}
          </Text>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.reportTitle}>Expenses by Category</Text>

        {Object.entries(expenseByCategory).map(([category, amount]) => (
          <Text key={category}>
            {category}: GHS {amount.toFixed(2)}
          </Text>
        ))}
      </View>
      <View style={styles.card}>
        <Text style={styles.reportTitle}>Highest Income Category</Text>

        <Text>
          {topIncomeCategory
            ? `${topIncomeCategory[0]} - GHS ${topIncomeCategory[1].toFixed(2)}`
            : "No income recorded"}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.reportTitle}>Highest Expense Category</Text>

        <Text>
          {topExpenseCategory
            ? `${topExpenseCategory[0]} - GHS ${topExpenseCategory[1].toFixed(2)}`
            : "No expenses recorded"}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.exportButton, { marginBottom: 40 }]}
        onPress={handleExport}
      >
        <Text style={styles.exportButtonText}>Export Summary</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    padding: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 50,
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },

  reportTitle: {
    fontWeight: "bold",
    marginBottom: 4,
  },

  backButton: {
    marginTop: 20,
    marginBottom: 10,
  },

  backText: {
    color: "#B83729",
    fontSize: 24,
    fontWeight: "bold",
  },
  exportButton: {
    backgroundColor: "#B83729",
    padding: 14,
    borderRadius: 10,
    marginTop: 20,
  },

  exportButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "bold",
  },
});

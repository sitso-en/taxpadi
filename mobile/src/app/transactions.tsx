import { router } from "expo-router";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useTransactions } from "../context/TransactionContext";

export default function TransactionsScreen() {
  const { transactions } = useTransactions();
  console.log("Transactions count:", transactions.length);
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const netPosition = totalIncome - totalExpenses;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 30 }}
    >
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>⬅️ Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Transactions</Text>
      <Text>Transactions Count: {transactions.length}</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/add-transaction")}
      >
        <Text style={styles.addButtonText}>➕ Add Transaction</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.transactionTitle}>Transaction Summary</Text>
        <Text>Total Income: GHS {totalIncome.toLocaleString()}</Text>

        <Text>Total Expenses: GHS {totalExpenses.toLocaleString()}</Text>

        <Text>Net Position: GHS {netPosition.toLocaleString()}</Text>
      </View>
      {transactions.map((transaction) => (
        <View key={transaction.id} style={styles.card}>
          <Text style={styles.transactionTitle}>
            {transaction.type === "income" ? "🟢" : "🔴"} {transaction.title}
          </Text>

          <Text>GHS {transaction.amount.toLocaleString()}</Text>
        </View>
      ))}
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

  transactionTitle: {
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
  addButton: {
    backgroundColor: "#B83729",
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: "center",
  },

  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});

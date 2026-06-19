import { Ionicons } from "@expo/vector-icons";
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
  const { transactions, deleteTransaction } = useTransactions();

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <Text style={styles.title}>Transactions</Text>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Ionicons
              name="arrow-down-circle-outline"
              size={24}
              color="#2E7D32"
            />
            <Text style={styles.summaryAmount}>
              GHS {totalIncome.toLocaleString()}
            </Text>
            <Text style={styles.summaryLabel}>Income</Text>
          </View>

          <View style={styles.summaryCard}>
            <Ionicons
              name="arrow-up-circle-outline"
              size={24}
              color="#C44736"
            />
            <Text style={styles.summaryAmount}>
              GHS {totalExpenses.toLocaleString()}
            </Text>
            <Text style={styles.summaryLabel}>Expenses</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Recent Transactions</Text>

        {transactions.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text>No transactions yet</Text>
          </View>
        ) : (
          transactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionCard}>
              <View style={styles.row}>
                <Ionicons
                  name={
                    transaction.type === "income"
                      ? "arrow-down-circle"
                      : "arrow-up-circle"
                  }
                  size={26}
                  color={transaction.type === "income" ? "#2E7D32" : "#C44736"}
                />

                <View style={styles.details}>
                  <Text style={styles.transactionTitle}>
                    {transaction.title}
                  </Text>

                  <Text style={styles.category}>{transaction.category}</Text>
                </View>

                <Text
                  style={{
                    fontWeight: "bold",
                    color:
                      transaction.type === "income" ? "#2E7D32" : "#C44736",
                  }}
                >
                  GHS {transaction.amount}
                </Text>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() =>
                    router.push(`/edit-transaction?id=${transaction.id}`)
                  }
                >
                  <Ionicons name="create-outline" size={18} color="#333" />
                  <Text style={[styles.buttonText, { color: "#333" }]}>
                    Edit
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteTransaction(transaction.id)}
                >
                  <Ionicons name="trash-outline" size={18} color="#C44736" />
                  <Text style={[styles.buttonText, { color: "#C44736" }]}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/add-transaction")}
      >
        <Ionicons name="add" size={32} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
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

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  summaryCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
  },

  summaryAmount: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 8,
  },

  summaryLabel: {
    color: "#666",
    marginTop: 4,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
  },

  transactionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  details: {
    flex: 1,
    marginLeft: 12,
  },

  transactionTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },

  category: {
    color: "#666",
    marginTop: 2,
  },

  buttonRow: {
    flexDirection: "row",
    marginTop: 12,
    gap: 10,
  },

  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    padding: 10,
    borderRadius: 8,
    flex: 1,
  },

  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FCE8E6",
    padding: 10,
    borderRadius: 8,
    flex: 1,
  },

  buttonText: {
    marginLeft: 6,
    fontWeight: "600",
  },

  fab: {
    position: "absolute",
    right: 25,
    bottom: 25,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#C44736",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
});

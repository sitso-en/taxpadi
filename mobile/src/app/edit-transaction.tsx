import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
} from "react-native";
import { useTransactions } from "../context/TransactionContext";

export default function EditTransactionScreen() {
  const { id } = useLocalSearchParams();
  const { transactions, editTransaction } = useTransactions();

  const transaction = transactions.find((t) => t.id === Number(id));

  const [title, setTitle] = useState(transaction?.title ?? "");
  const [amount, setAmount] = useState(transaction?.amount.toString() ?? "");
  const [type, setType] = useState<"income" | "expense">(
    transaction?.type ?? "income",
  );
  const handleSave = () => {
    if (!transaction) return;

    editTransaction({
      id: transaction.id,
      title,
      amount: Number(amount),
      type,
    });

    router.push("/transactions");
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>⬅️ Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Edit Transaction</Text>

      <Text style={styles.label}>Transaction Name</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} />

      <Text style={styles.label}>Amount (GHS)</Text>
      <TextInput
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Type</Text>

      <TouchableOpacity
        style={[
          styles.typeButton,
          type === "income" && styles.selectedTypeButton,
        ]}
        onPress={() => setType("income")}
      >
        <Text>🟢 Income</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.typeButton,
          type === "expense" && styles.selectedTypeButton,
        ]}
        onPress={() => setType("expense")}
      >
        <Text>🔴 Expense</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
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
    marginTop: 20,
  },

  back: {
    color: "#B83729",
    fontSize: 20,
    marginTop: 20,
  },
  label: {
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: "#D9D9D9",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },

  typeButton: {
    backgroundColor: "#F5F5F5",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  selectedTypeButton: {
    borderWidth: 2,
    borderColor: "#B83729",
  },
  saveButton: {
    backgroundColor: "#B83729",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});

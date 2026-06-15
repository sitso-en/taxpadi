import { router } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTransactions } from "../context/TransactionContext";
export default function AddTransactionScreen() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("income");
  const { transactions, addTransaction } = useTransactions();
  const [category, setCategory] = useState("Other");

  const handleSave = () => {
    if (!title.trim() || !amount.trim()) {
      return;
    }

    addTransaction({
      id: Date.now(),
      title,
      amount: Number(amount),
      type,
      category,
    });

    router.push("/transactions");
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 30 }}
    >
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>⬅️ Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Add Transaction</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Transaction Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Sales Revenue"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Amount (GHS)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 2500"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
        <Text style={styles.label}>Category</Text>
        <TextInput
          style={styles.input}
          value={category}
          onChangeText={setCategory}
          placeholder="e.g. Sales, Utilities"
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
        <Text style={styles.selectedTypeText}>
          Selected Type: {type === "income" ? "🟢 Income" : "🔴 Expense"}
        </Text>
        <View style={{ marginTop: 10 }}>
          <Text>Preview</Text>
          <Text>Name: {title || "Not entered"}</Text>
          <Text>Amount: {amount || "0"}</Text>
          <Text>Type: {type === "income" ? "🟢 Income" : "🔴 Expense"}</Text>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Transaction</Text>
        </TouchableOpacity>
      </View>
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
  },

  label: {
    fontWeight: "bold",
    marginBottom: 6,
    marginTop: 10,
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

  saveButton: {
    backgroundColor: "#B83729",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
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
  selectedTypeButton: {
    borderWidth: 2,
    borderColor: "#B83729",
  },
  selectedTypeText: {
    marginTop: 8,
    marginBottom: 12,
    fontWeight: "bold",
  },
});

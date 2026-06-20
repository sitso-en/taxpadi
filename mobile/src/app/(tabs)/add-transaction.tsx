import { Ionicons } from "@expo/vector-icons";
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
import { useTransactions } from "../../context/TransactionContext";

export default function AddTransactionScreen() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("income");
  const [category, setCategory] = useState("Other");

  const { addTransaction } = useTransactions();

  const handleSave = () => {
    if (!title.trim() || !amount.trim()) return;

    addTransaction({
      id: Date.now(),
      title,
      amount: Number(amount),
      type,
      category,
    });

    router.replace("/transactions");
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/transactions")}>
          <Ionicons name="chevron-back" size={28} color="#222" />
        </TouchableOpacity>

        <Text style={styles.title}>Log Transaction</Text>
      </View>

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
          placeholder="e.g. Sales, Utilities"
          value={category}
          onChangeText={setCategory}
        />
      </View>

      <Text style={styles.sectionTitle}>Transaction Type</Text>

      <TouchableOpacity
        style={[
          styles.typeButton,
          type === "income" && styles.selectedTypeButton,
        ]}
        onPress={() => setType("income")}
      >
        <Ionicons name="arrow-up-circle-outline" size={22} color="#34A853" />

        <Text style={styles.typeText}>Income</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.typeButton,
          type === "expense" && styles.selectedTypeButton,
        ]}
        onPress={() => setType("expense")}
      >
        <Ionicons name="arrow-down-circle-outline" size={22} color="#EA4335" />

        <Text style={styles.typeText}>Expense</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Transaction</Text>
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

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginLeft: 10,
    color: "#111",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#444",
    marginBottom: 8,
  },

  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#444",
  },

  typeButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  selectedTypeButton: {
    borderWidth: 2,
    borderColor: "#C44736",
  },

  typeText: {
    marginLeft: 10,
    fontWeight: "600",
    fontSize: 15,
  },

  saveButton: {
    backgroundColor: "#C44736",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});

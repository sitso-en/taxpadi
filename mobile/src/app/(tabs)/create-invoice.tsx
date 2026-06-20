import { router } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";

import { useInvoices } from "../../context/InvoiceContext";

export default function CreateInvoiceScreen() {
  const { addInvoice } = useInvoices();

  const [customerName, setCustomerName] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleCreateInvoice = () => {
    if (
      !customerName.trim() ||
      !invoiceNumber.trim() ||
      !amount.trim() ||
      !dueDate.trim()
    ) {
      alert("Please fill in all fields.");
      return;
    }

    addInvoice({
      id: Date.now(),
      customerName,
      invoiceNumber,
      amount: Number(amount),
      dueDate,
    });

    alert("Invoice created successfully!");

    router.replace("/invoices");
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <Text style={styles.title}>Create Invoice</Text>

      <Text style={styles.label}>Customer Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter customer name"
        value={customerName}
        onChangeText={setCustomerName}
      />

      <Text style={styles.label}>Invoice Number</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. INV-001"
        value={invoiceNumber}
        onChangeText={setInvoiceNumber}
      />

      <Text style={styles.label}>Amount (GHS)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 2500"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <Text style={styles.label}>Due Date</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 30/06/2026"
        value={dueDate}
        onChangeText={setDueDate}
      />

      <TouchableOpacity
        style={styles.createButton}
        onPress={handleCreateInvoice}
      >
        <Text style={styles.createButtonText}>Create Invoice</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    padding: 24,
    paddingTop: 50,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
  },

  label: {
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 10,
  },

  input: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },

  createButton: {
    backgroundColor: "#C44736",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },

  createButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});

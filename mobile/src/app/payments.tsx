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
import { usePayments } from "../context/PaymentContext";

export default function PaymentsScreen() {
  const { payments, addPayment } = usePayments();
  const paymentsMade = payments.reduce(
    (sum, payment) => sum + payment.amount,
    0,
  );

  const totalDue = 5000;

  const outstandingBalance = totalDue - paymentsMade;

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const handleAddPayment = () => {
    if (!description || !amount) return;

    addPayment({
      id: Date.now(),
      description,
      amount: Number(amount),
      date: new Date().toLocaleDateString(),
      status: "Pending",
    });

    setDescription("");
    setAmount("");
  };
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 30 }}
    >
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>⬅️ Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Payments</Text>
      <TextInput
        style={styles.input}
        placeholder="Payment Description"
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        style={styles.input}
        placeholder="Amount"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />
      <TouchableOpacity style={styles.addButton} onPress={handleAddPayment}>
        <Text style={styles.addButtonText}>Add Payment</Text>
      </TouchableOpacity>
      <View style={styles.card}>
        <Text style={styles.paymentTitle}>Payment Summary</Text>
        <Text>Total Due: GHS {totalDue.toFixed(2)}</Text>

        <Text>Payments Made: GHS {paymentsMade.toFixed(2)}</Text>

        <Text>Outstanding Balance: GHS {outstandingBalance.toFixed(2)}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.paymentTitle}>VAT Payment</Text>
        <Text>Amount Due: GHS 0.00</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.paymentTitle}>PAYE Payment</Text>
        <Text>Amount Due: GHS 0.00</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.paymentTitle}>Payment History</Text>

        {payments.length === 0 ? (
          <Text>No payments recorded</Text>
        ) : (
          payments.map((payment) => (
            <View
              key={payment.id}
              style={{
                marginTop: 8,
                paddingTop: 8,
                borderTopWidth: 1,
                borderColor: "#EEE",
              }}
            >
              <Text>{payment.description}</Text>
              <Text>GHS {payment.amount}</Text>
              <Text>{payment.date}</Text>
              <Text>{payment.status}</Text>
            </View>
          ))
        )}
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
    marginBottom: 12,
  },

  paymentTitle: {
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
  input: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  addButton: {
    backgroundColor: "#B83729",
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
  },

  addButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "bold",
  },
});

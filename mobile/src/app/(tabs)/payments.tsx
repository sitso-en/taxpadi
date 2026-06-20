import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { usePayments } from "../../context/PaymentContext";

export default function PaymentsScreen() {
  const { payments, addPayment, deletePayment } = usePayments();

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"momo" | "bank">("momo");

  const paymentsMade = payments.reduce(
    (sum, payment) => sum + payment.amount,
    0,
  );

  const totalDue = 5000;
  const outstandingBalance = totalDue - paymentsMade;

  const handleAddPayment = () => {
    if (!description || !amount) return;

    addPayment({
      id: Date.now(),
      description,
      amount: Number(amount),
      date: new Date().toLocaleDateString(),
      status: "Paid",
    });

    setDescription("");
    setAmount("");
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <Text style={styles.title}>Payments</Text>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Outstanding Balance</Text>

        <Text style={styles.balanceAmount}>
          GHS {outstandingBalance.toFixed(2)}
        </Text>

        <Text style={styles.balanceSubtext}>
          Total Due: GHS {totalDue.toFixed(2)}
        </Text>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Ionicons name="checkmark-circle-outline" size={24} color="#34A853" />

          <Text style={styles.summaryValue}>GHS {paymentsMade.toFixed(2)}</Text>

          <Text style={styles.summaryLabel}>Paid</Text>
        </View>

        <View style={styles.summaryCard}>
          <Ionicons name="wallet-outline" size={24} color="#C44736" />

          <Text style={styles.summaryValue}>
            GHS {outstandingBalance.toFixed(2)}
          </Text>

          <Text style={styles.summaryLabel}>Due</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Make Payment</Text>

        <Text style={styles.fieldLabel}>Payment Method</Text>

        <TouchableOpacity
          style={[
            styles.methodButton,
            paymentMethod === "momo" && styles.selectedMethod,
          ]}
          onPress={() => setPaymentMethod("momo")}
        >
          <Ionicons name="phone-portrait-outline" size={20} color="#34A853" />

          <Text style={styles.methodText}>Mobile Money</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.methodButton,
            paymentMethod === "bank" && styles.selectedMethod,
          ]}
          onPress={() => setPaymentMethod("bank")}
        >
          <Ionicons name="business-outline" size={20} color="#2563EB" />

          <Text style={styles.methodText}>Bank Transfer</Text>
        </TouchableOpacity>

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
          <Text style={styles.addButtonText}>Submit Payment</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Payment History</Text>

        {payments.length === 0 ? (
          <Text style={styles.emptyText}>No payments recorded</Text>
        ) : (
          payments.map((payment) => (
            <View key={payment.id} style={styles.paymentItem}>
              <View style={styles.paymentRow}>
                <View>
                  <Text style={styles.paymentTitle}>{payment.description}</Text>

                  <Text style={styles.paymentDate}>{payment.date}</Text>
                </View>

                <Text style={styles.paymentAmount}>GHS {payment.amount}</Text>
              </View>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deletePayment(payment.id)}
              >
                <Ionicons name="trash-outline" size={18} color="#C44736" />

                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
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
    padding: 20,
    paddingTop: 50,
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
  },

  balanceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#EFEFEF",
  },

  balanceLabel: {
    color: "#666",
  },

  balanceAmount: {
    color: "#111",
    fontSize: 30,
    fontWeight: "bold",
    marginTop: 8,
  },

  balanceSubtext: {
    color: "#888",
    marginTop: 6,
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

  summaryValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 8,
  },

  summaryLabel: {
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

  fieldLabel: {
    fontWeight: "600",
    marginBottom: 10,
    color: "#444",
  },

  methodButton: {
    backgroundColor: "#F7F7F7",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  selectedMethod: {
    borderWidth: 2,
    borderColor: "#C44736",
  },

  methodText: {
    marginLeft: 10,
    fontWeight: "600",
  },

  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 10,
  },

  addButton: {
    backgroundColor: "#C44736",
    padding: 15,
    borderRadius: 12,
    marginTop: 16,
  },

  addButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "bold",
  },

  emptyText: {
    color: "#666",
  },

  paymentItem: {
    borderTopWidth: 1,
    borderColor: "#EEE",
    paddingTop: 12,
    marginTop: 12,
  },

  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  paymentTitle: {
    fontWeight: "600",
  },

  paymentDate: {
    color: "#666",
    marginTop: 2,
  },

  paymentAmount: {
    fontWeight: "bold",
  },

  deleteButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FCE8E6",
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },

  deleteText: {
    color: "#C44736",
    marginLeft: 6,
    fontWeight: "600",
  },
});

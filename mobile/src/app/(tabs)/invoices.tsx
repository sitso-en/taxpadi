import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useInvoices } from "../../context/InvoiceContext";

export default function InvoicesScreen() {
  const { invoices, deleteInvoice } = useInvoices();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingBottom: 80,
      }}
    >
      <TouchableOpacity
        onPress={() => router.push("/more")}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={24} color="#C44736" />
      </TouchableOpacity>
      <Text style={styles.title}>Invoices</Text>

      <Text style={styles.count}>Total Invoices: {invoices.length}</Text>

      {invoices.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>No invoices yet</Text>

          <Text style={styles.cardText}>
            Create and manage invoices for your customers.
          </Text>
        </View>
      ) : (
        invoices.map((invoice) => (
          <View key={invoice.id} style={styles.invoiceCard}>
            <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>

            <Text>{invoice.customerName}</Text>

            <Text>GHS {invoice.amount.toFixed(2)}</Text>

            <Text>Due: {invoice.dueDate}</Text>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteInvoice(invoice.id)}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/create-invoice")}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
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
    marginBottom: 10,
  },

  count: {
    marginBottom: 20,
    color: "#666",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },

  cardText: {
    color: "#666",
  },

  invoiceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },

  invoiceNumber: {
    fontWeight: "bold",
    marginBottom: 4,
  },

  deleteButton: {
    backgroundColor: "#FCE8E6",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },

  deleteText: {
    textAlign: "center",
    color: "#C44736",
    fontWeight: "600",
  },

  fab: {
    position: "absolute",
    right: 24,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#C44736",
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    marginBottom: 15,
  },
});

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { usePayments } from "../../context/PaymentContext";
import { useReturns } from "../../context/ReturnContext";
import { useTransactions } from "../../context/TransactionContext";

export default function ReportsScreen() {
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

  const totalPayments = payments.reduce(
    (sum, payment) => sum + payment.amount,
    0,
  );

  const filedReturns = returns.filter((r) => r.status === "Filed").length;

  const pendingReturns = returns.filter((r) => r.status === "Pending").length;

  const handleExportPDF = () => {
    alert("PDF export coming soon");
  };

  const handleExportCSV = () => {
    alert("CSV export coming soon");
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <TouchableOpacity
        onPress={() => router.push("/more")}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={24} color="#C44736" />
      </TouchableOpacity>
      <Text style={styles.title}>Reports & Export</Text>

      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>Annual Tax Summary</Text>

        <Text style={styles.heroAmount}>GHS {netPosition.toFixed(2)}</Text>

        <Text style={styles.heroSubtext}>Net Position</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="bar-chart-outline" size={22} color="#34A853" />

          <Text style={styles.cardTitle}>Income Statement</Text>
        </View>

        <Text>Total Income: GHS {totalIncome.toFixed(2)}</Text>

        <Text style={{ marginTop: 8 }}>
          Total Expenses: GHS {totalExpenses.toFixed(2)}
        </Text>

        <Text
          style={{
            marginTop: 8,
            fontWeight: "600",
          }}
        >
          Net Position: GHS {netPosition.toFixed(2)}
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="document-text-outline" size={22} color="#2563EB" />

          <Text style={styles.cardTitle}>Tax Filing Summary</Text>
        </View>

        <Text>Filed Returns: {filedReturns}</Text>

        <Text style={{ marginTop: 8 }}>Pending Returns: {pendingReturns}</Text>

        <Text
          style={{
            marginTop: 8,
            fontWeight: "600",
            color: pendingReturns > 0 ? "#E65100" : "#2E7D32",
          }}
        >
          {pendingReturns > 0 ? "Action Required" : "Good Standing"}
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="card-outline" size={22} color="#C44736" />

          <Text style={styles.cardTitle}>VAT / Payment Summary</Text>
        </View>

        <Text>Payments Recorded: {payments.length}</Text>

        <Text style={{ marginTop: 8 }}>
          Total Payments: GHS {totalPayments.toFixed(2)}
        </Text>
      </View>

      <View style={styles.exportCard}>
        <Text style={styles.exportTitle}>Export Reports</Text>

        <TouchableOpacity style={styles.exportButton} onPress={handleExportPDF}>
          <Ionicons name="document-outline" size={18} color="#FFFFFF" />

          <Text style={styles.exportButtonText}>Export PDF</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.exportButton, { marginTop: 10 }]}
          onPress={handleExportCSV}
        >
          <Ionicons name="download-outline" size={18} color="#FFFFFF" />

          <Text style={styles.exportButtonText}>Export CSV</Text>
        </TouchableOpacity>
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

  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
  },

  heroLabel: {
    color: "#666",
  },

  heroAmount: {
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 8,
    color: "#111",
  },

  heroSubtext: {
    color: "#666",
    marginTop: 6,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  cardTitle: {
    marginLeft: 10,
    fontSize: 17,
    fontWeight: "600",
  },

  exportCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginTop: 4,
  },

  exportTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 14,
  },

  exportButton: {
    backgroundColor: "#C44736",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  exportButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    marginLeft: 8,
  },
  backButton: {
    marginBottom: 15,
  },
});

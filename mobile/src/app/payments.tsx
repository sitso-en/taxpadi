import { router } from "expo-router";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function PaymentsScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 30 }}
    >
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>⬅️ Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Payments</Text>
      <View style={styles.card}>
        <Text style={styles.paymentTitle}>Payment Summary</Text>
        <Text>Total Due: GHS 0.00</Text>
        <Text>Payments Made: GHS 0.00</Text>
        <Text>Outstanding Balance: GHS 0.00</Text>
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
        <Text>No payments recorded</Text>
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
});

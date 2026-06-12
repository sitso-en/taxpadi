import { router } from "expo-router";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function TransactionsScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 30 }}
    >
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>⬅️ Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Transactions</Text>
      <View style={styles.card}>
        <Text style={styles.transactionTitle}>Transaction Summary</Text>
        <Text>Total Income: GHS 2,500</Text>
        <Text>Total Expenses: GHS 520</Text>
        <Text>Net Position: GHS 1,980</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.transactionTitle}>Sales Revenue</Text>
        <Text>GHS 2,500</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.transactionTitle}>Office Supplies</Text>
        <Text>GHS 400</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.transactionTitle}>Internet Bill</Text>
        <Text>GHS 120</Text>
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

  transactionTitle: {
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

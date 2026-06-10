import { router } from "expo-router";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function ReportsScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 30 }}
    >
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>⬅️ Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Reports & Export</Text>

      <View style={styles.card}>
        <Text style={styles.reportTitle}>Total Transactions</Text>
        <Text>3</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.reportTitle}>Tax Returns Filed</Text>
        <Text>0</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.reportTitle}>Outstanding Payments</Text>
        <Text>GHS 0.00</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.reportTitle}>Compliance Status</Text>
        <Text>🟢 Good Standing</Text>
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

  reportTitle: {
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

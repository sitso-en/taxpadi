import { router } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 30 }}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.cardTitle}>Welcome Back, TaxPayer 👋</Text>
        <Text>Manage your taxes with confidence.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Current Plan</Text>
        <Text style={styles.highlightText}>Free Tier</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Profile Overview</Text>

        <Text>TIN: Not Provided</Text>
        <Text>VAT Registered: No</Text>
        <Text>PAYE Registered: No</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Compliance Status</Text>

        <Text
          style={{
            color: "#2E7D32",
            fontWeight: "bold",
            fontSize: 18,
          }}
        >
          🟢 Good Standing
        </Text>
        <Text>No overdue filings detected.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Tax Summary</Text>

        <Text>Total Returns Filed: 0</Text>
        <Text>Pending Returns: 0</Text>
        <Text>Compliance Status: Good Standing ✅</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Upcoming Deadline</Text>
        <Text style={styles.highlightText}>VAT Filing - 15 June 2026</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recent Activity</Text>

        <Text>• VAT Filing deadline generated</Text>
        <Text>• Profile updated</Text>
        <Text>• Subscription status checked</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account Center</Text>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/deadlines")}
        >
          <Text style={styles.actionText}>📅 View Deadlines</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/transactions")}
        >
          <Text style={styles.actionText}>💰 Transactions</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/returns")}
        >
          <Text style={styles.actionText}>📄 Tax Returns</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/payments")}
        >
          <Text style={styles.actionText}>💳 Payments</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/reports")}
        >
          <Text style={styles.actionText}>📊 Reports & Export</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/settings")}
        >
          <Text style={styles.actionText}>Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/subscription")}
        >
          <Text style={styles.actionText}>Subscription</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/notification-preferences")}
        >
          <Text style={styles.actionText}>Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/tax-profile")}
        >
          <Text style={styles.actionText}>Tax Profile</Text>
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
    paddingTop: 60,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  actionButton: {
    backgroundColor: "#B83729",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },

  actionText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "600",
  },
  highlightText: {
    color: "#B83729",
    fontWeight: "bold",
  },
});

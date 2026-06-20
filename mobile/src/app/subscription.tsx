import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SubscriptionScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#C44736" />
      </TouchableOpacity>
      <Text style={styles.title}>Subscription</Text>

      <View style={styles.planCard}>
        <Ionicons name="card-outline" size={32} color="#C44736" />

        <Text style={styles.planName}>Free Plan</Text>

        <Text style={styles.planDescription}>
          Basic tax management features with transactions, tax returns,
          payments, invoices and reports.
        </Text>
      </View>

      <View style={styles.featuresCard}>
        <Text style={styles.sectionTitle}>Included Features</Text>

        <Text style={styles.feature}>• Transaction Tracking</Text>

        <Text style={styles.feature}>• Tax Return Management</Text>

        <Text style={styles.feature}>• Payment Tracking</Text>

        <Text style={styles.feature}>• Reports & Analytics</Text>

        <Text style={styles.feature}>• Invoice Management</Text>
      </View>

      <TouchableOpacity
        style={styles.upgradeButton}
        onPress={() => alert("Upgrade feature coming soon")}
      >
        <Ionicons name="rocket-outline" size={20} color="#FFFFFF" />

        <Text style={styles.upgradeButtonText}>Upgrade Plan</Text>
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

  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
  },

  planCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
  },

  planName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#C44736",
    marginTop: 12,
  },

  planDescription: {
    color: "#666",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 22,
  },

  featuresCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },

  feature: {
    marginBottom: 10,
    color: "#333",
  },

  upgradeButton: {
    backgroundColor: "#C44736",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  upgradeButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 16,
  },
  backButton: {
    marginBottom: 15,
  },
});

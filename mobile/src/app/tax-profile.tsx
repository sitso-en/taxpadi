import { router } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function TaxProfileScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 30 }}
    >
      <TouchableOpacity
        onPress={() => router.replace("/more")}
        style={styles.backButton}
      >
        <Text style={styles.backText}>⬅️ Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Tax Profile</Text>

      <View style={styles.card}>
        <Text style={styles.label}>TIN</Text>
        <Text>Not Provided</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Business Type</Text>
        <Text>Not Set</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Tax Year</Text>
        <Text>2026</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>VAT Registered</Text>
        <Text>No</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>PAYE Registered</Text>
        <Text>No</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Onboarding Status</Text>
        <Text>Incomplete</Text>
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

  label: {
    fontWeight: "600",
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

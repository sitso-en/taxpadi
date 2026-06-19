import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function TaxProfileScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <Text style={styles.title}>Tax Profile</Text>

      <View style={styles.profileCard}>
        <Ionicons name="document-text-outline" size={36} color="#C44736" />

        <Text style={styles.profileTitle}>Tax Information</Text>

        <Text style={styles.profileSubtitle}>
          Complete your profile to improve compliance tracking and reporting.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>TIN</Text>
        <Text style={styles.value}>Not Provided</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Business Type</Text>
        <Text style={styles.value}>Not Set</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Tax Year</Text>
        <Text style={styles.value}>2026</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>VAT Registered</Text>
        <Text style={styles.value}>No</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>PAYE Registered</Text>
        <Text style={styles.value}>No</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Onboarding Status</Text>

        <Text
          style={[
            styles.value,
            {
              color: "#E65100",
            },
          ]}
        >
          Incomplete
        </Text>
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

  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
  },

  profileTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 12,
  },

  profileSubtitle: {
    textAlign: "center",
    color: "#666",
    marginTop: 8,
    lineHeight: 22,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
  },

  label: {
    color: "#666",
    marginBottom: 4,
  },

  value: {
    fontSize: 16,
    fontWeight: "600",
  },
});

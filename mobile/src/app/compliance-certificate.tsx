import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function ComplianceCertificateScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <TouchableOpacity
        onPress={() => router.back()}
        style={{ marginBottom: 15 }}
      >
        <Ionicons name="arrow-back" size={24} color="#C44736" />
      </TouchableOpacity>
      <Text style={styles.title}>Compliance Certificate</Text>

      <View style={styles.certificateCard}>
        <Ionicons name="shield-checkmark" size={80} color="#34A853" />

        <Text style={styles.status}>Tax Compliant</Text>

        <Text style={styles.description}>
          Congratulations! Your business currently meets all tax compliance
          requirements.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Certificate Details</Text>

        <Text>Business Name: TaxPadi User</Text>

        <Text style={styles.detail}>Status: Active</Text>

        <Text style={styles.detail}>Valid Until: 31 Dec 2026</Text>

        <Text style={styles.detail}>Certificate ID: TXP-2026-001</Text>
      </View>

      <TouchableOpacity
        style={styles.downloadButton}
        onPress={() => alert("Certificate downloaded successfully!")}
      >
        <Ionicons name="download-outline" size={20} color="#FFFFFF" />

        <Text style={styles.downloadText}>Download Certificate</Text>
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

  certificateCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
  },

  status: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 15,
    color: "#34A853",
  },

  description: {
    textAlign: "center",
    marginTop: 10,
    color: "#666",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },

  detail: {
    marginTop: 8,
  },

  downloadButton: {
    backgroundColor: "#C44736",
    padding: 15,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  downloadText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    marginLeft: 8,
  },
});

import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useReturns } from "../context/ReturnContext";

export default function HomeScreen() {
  const { returns } = useReturns();

  const filedReturns = returns.filter((r) => r.status === "Filed").length;

  const pendingReturns = returns.filter((r) => r.status === "Pending").length;

  const complianceStatus =
    pendingReturns === 0 ? "Good Standing" : "Attention Required";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 30 }}
    >
      <Text style={styles.greeting}>Good morning 👋</Text>

      <View style={styles.taxCard}>
        <Text style={styles.taxLabel}>Tax Score</Text>

        <Text style={styles.taxAmount}>
          GHS {(filedReturns * 1200).toFixed(2)}
        </Text>

        <Text style={styles.taxSubText}>
          Based on your current tax activity
        </Text>
      </View>

      <View style={styles.grid}>
        <View style={styles.statCard}>
          <Ionicons name="document-text-outline" size={24} color="#C44736" />
          <Text style={styles.statNumber}>{filedReturns}</Text>
          <Text style={styles.statLabel}>Filed</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="time-outline" size={24} color="#C44736" />
          <Text style={styles.statNumber}>{pendingReturns}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="shield-checkmark-outline" size={24} color="#C44736" />
          <Text style={styles.statNumber}>
            {pendingReturns === 0 ? "100%" : "80%"}
          </Text>
          <Text style={styles.statLabel}>Compliance</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="cash-outline" size={24} color="#C44736" />
          <Text style={styles.statNumber}>GHS 0</Text>
          <Text style={styles.statLabel}>Tax Due</Text>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Compliance Status</Text>

        <Text
          style={[
            styles.statusText,
            {
              color: pendingReturns === 0 ? "#2E7D32" : "#E65100",
            },
          ]}
        >
          {complianceStatus}
        </Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Upcoming Deadlines</Text>

        <View style={styles.deadlineItem}>
          <Text style={styles.deadlineTitle}>VAT Filing</Text>
          <Text style={styles.deadlineDate}>15 June 2026</Text>
        </View>

        <View style={styles.deadlineItem}>
          <Text style={styles.deadlineTitle}>PAYE Filing</Text>
          <Text style={styles.deadlineDate}>30 June 2026</Text>
        </View>
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

  greeting: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 18,
    color: "#111",
  },

  taxCard: {
    backgroundColor: "#C44736",
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
  },

  taxLabel: {
    color: "#FFFFFF",
    fontSize: 15,
  },

  taxAmount: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "bold",
    marginTop: 8,
  },

  taxSubText: {
    color: "#FFFFFF",
    marginTop: 6,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  statCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 6,

    elevation: 2,
  },

  statNumber: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 8,
  },

  statLabel: {
    color: "#666",
    marginTop: 4,
  },

  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 6,

    elevation: 2,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },

  statusText: {
    fontWeight: "bold",
    fontSize: 18,
  },

  deadlineItem: {
    marginBottom: 12,
  },

  deadlineTitle: {
    fontWeight: "600",
  },

  deadlineDate: {
    color: "#666",
    marginTop: 2,
  },
});

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useReturns } from "../../context/ReturnContext";

export default function HomeScreen() {
  const { returns } = useReturns();

  const filedReturns = returns.filter((r) => r.status === "Filed").length;

  const pendingReturns = returns.filter((r) => r.status === "Pending").length;

  const complianceRate =
    filedReturns + pendingReturns === 0
      ? 100
      : Math.round((filedReturns / (filedReturns + pendingReturns)) * 100);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <Text style={styles.greeting}>Welcome Back 👋</Text>

      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>Compliance Score</Text>

        <Text style={styles.heroScore}>{complianceRate}%</Text>

        <Text style={styles.heroSubtext}>Based on your tax filings</Text>
      </View>

      <View style={styles.grid}>
        <View style={styles.statCard}>
          <Ionicons name="document-text-outline" size={24} color="#2563EB" />

          <Text style={styles.statNumber}>{filedReturns}</Text>

          <Text style={styles.statLabel}>Filed</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="time-outline" size={24} color="#E65100" />

          <Text style={styles.statNumber}>{pendingReturns}</Text>

          <Text style={styles.statLabel}>Pending</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="shield-checkmark-outline" size={24} color="#34A853" />

          <Text style={styles.statNumber}>{complianceRate}%</Text>

          <Text style={styles.statLabel}>Compliance</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="cash-outline" size={24} color="#C44736" />

          <Text style={styles.statNumber}>GHS 0</Text>

          <Text style={styles.statLabel}>Tax Due</Text>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/add-transaction")}
        >
          <Ionicons name="add-circle-outline" size={20} color="#C44736" />

          <Text style={styles.actionText}>Log Transaction</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/returns")}
        >
          <Ionicons name="document-outline" size={20} color="#C44736" />

          <Text style={styles.actionText}>File Tax Return</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/payments")}
        >
          <Ionicons name="card-outline" size={20} color="#C44736" />

          <Text style={styles.actionText}>Make Payment</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Compliance Status</Text>

        <Text
          style={{
            color: pendingReturns === 0 ? "#34A853" : "#E65100",
            fontWeight: "bold",
            fontSize: 18,
          }}
        >
          {pendingReturns === 0 ? "Good Standing" : "Action Required"}
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

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>

        <Text style={styles.activityText}>• Dashboard viewed</Text>

        <Text style={styles.activityText}>• Tax profile checked</Text>

        <Text style={styles.activityText}>• Reports generated</Text>
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

  heroScore: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#111",
    marginTop: 8,
  },

  heroSubtext: {
    color: "#666",
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
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },

  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },

  actionText: {
    marginLeft: 10,
    fontWeight: "600",
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

  activityText: {
    marginBottom: 8,
    color: "#444",
  },
});

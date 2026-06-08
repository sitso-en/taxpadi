import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
export default function ActiveSessionsScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Active Sessions</Text>

      <Text style={styles.subtitle}>
        Manage devices currently signed into your account
      </Text>

      <View style={[styles.sessionCard, styles.currentSessionCard]}>
        <Text style={styles.currentBadge}>CURRENT SESSION</Text>

        <Text style={styles.deviceName}>Chrome on Windows</Text>

        <Text style={styles.sessionInfo}>IP: 192.168.1.100</Text>

        <Text style={styles.sessionInfo}>Expires: Jun 30, 2026</Text>
      </View>
      <View style={styles.sessionCard}>
        <Text style={styles.deviceName}>iPhone 13</Text>

        <Text style={styles.sessionInfo}>IP: 10.0.0.25</Text>

        <Text style={styles.sessionInfo}>Expires: Jul 10, 2026</Text>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => alert("Device logged out")}
        >
          <Text style={styles.logoutButtonText}>Log Out Device</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.sessionCard}>
        <Text style={styles.deviceName}>MacBook Pro</Text>

        <Text style={styles.sessionInfo}>IP: 172.16.0.10</Text>

        <Text style={styles.sessionInfo}>Expires: Jul 15, 2026</Text>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => alert("Device logged out")}
        >
          <Text style={styles.logoutButtonText}>Log Out Device</Text>
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
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#110503",
    marginTop: 50,
  },

  subtitle: {
    marginTop: 10,
    marginBottom: 20,
    fontSize: 16,
    color: "#1F1F1F",
  },

  sessionCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#EBEBEB",
  },

  currentBadge: {
    color: "#B83729",
    fontWeight: "bold",
    marginBottom: 8,
  },

  deviceName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#110503",
  },

  sessionInfo: {
    marginTop: 6,
    color: "#666",
  },
  logoutButton: {
    marginTop: 12,
    backgroundColor: "#B83729",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },

  logoutButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  currentSessionCard: {
    borderColor: "#B83729",
    borderWidth: 2,
  },
});

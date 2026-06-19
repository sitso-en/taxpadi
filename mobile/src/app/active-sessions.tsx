import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ActiveSessionsScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/settings")}>
          <Ionicons name="chevron-back" size={28} color="#222" />
        </TouchableOpacity>

        <Text style={styles.title}>Active Sessions</Text>
      </View>

      <Text style={styles.subtitle}>
        Manage devices currently signed into your account
      </Text>

      <View style={[styles.card, styles.currentCard]}>
        <View style={styles.row}>
          <Ionicons name="desktop-outline" size={24} color="#C44736" />

          <Text style={styles.deviceName}>Chrome on Windows</Text>
        </View>

        <Text style={styles.currentBadge}>Current Session</Text>

        <Text style={styles.info}>IP: 192.168.1.100</Text>

        <Text style={styles.info}>Expires: Jun 30, 2026</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <Ionicons name="phone-portrait-outline" size={24} color="#222" />

          <Text style={styles.deviceName}>iPhone 13</Text>
        </View>

        <Text style={styles.info}>IP: 10.0.0.25</Text>

        <Text style={styles.info}>Expires: Jul 10, 2026</Text>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => alert("Device logged out")}
        >
          <Ionicons name="log-out-outline" size={18} color="#C44736" />

          <Text style={styles.logoutText}>Log Out Device</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <Ionicons name="laptop-outline" size={24} color="#222" />

          <Text style={styles.deviceName}>MacBook Pro</Text>
        </View>

        <Text style={styles.info}>IP: 172.16.0.10</Text>

        <Text style={styles.info}>Expires: Jul 15, 2026</Text>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => alert("Device logged out")}
        >
          <Ionicons name="log-out-outline" size={18} color="#C44736" />

          <Text style={styles.logoutText}>Log Out Device</Text>
        </TouchableOpacity>
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

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginLeft: 10,
  },

  subtitle: {
    color: "#666",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },

  currentCard: {
    borderWidth: 2,
    borderColor: "#C44736",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  deviceName: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 10,
  },

  currentBadge: {
    color: "#C44736",
    fontWeight: "600",
    marginTop: 10,
  },

  info: {
    color: "#666",
    marginTop: 6,
  },

  logoutButton: {
    backgroundColor: "#FCE8E6",
    borderRadius: 10,
    padding: 12,
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  logoutText: {
    color: "#C44736",
    fontWeight: "600",
    marginLeft: 6,
  },
});

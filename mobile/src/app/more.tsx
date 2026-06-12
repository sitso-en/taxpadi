import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";

export default function MoreScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 30 }}
    >
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>⬅️ Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>More</Text>

      <TouchableOpacity
        style={styles.item}
        onPress={() => router.push("/settings")}
      >
        <Text>⚙️ Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        onPress={() => router.push("/notification-preferences")}
      >
        <Text>🔔 Notifications</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        onPress={() => router.push("/subscription")}
      >
        <Text>💳 Subscription</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        onPress={() => router.push("/tax-profile")}
      >
        <Text>📄 Tax Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        onPress={() => router.push("/logout-confirmation")}
      >
        <Text>🚪 Logout</Text>
      </TouchableOpacity>
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

  item: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
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

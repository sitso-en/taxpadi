import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <TouchableOpacity
        style={styles.item}
        onPress={() => router.push("/edit-profile")}
      >
        <Text>Edit Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.item}
        onPress={() => router.push("/notification-preferences")}
      >
        <Text>Notification Preferences</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        onPress={() => router.push("/active-sessions")}
      >
        <Text>Active Sessions</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.item}
        onPress={() => router.push("/subscription")}
      >
        <Text>Current Plan</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        onPress={() => router.push("/logout-confirmation")}
      >
        <Text>Log Out</Text>
      </TouchableOpacity>
    </View>
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
    marginBottom: 20,
  },

  item: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
  },
});

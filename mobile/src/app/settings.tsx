import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SettingsScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <Text style={styles.title}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>

        <TouchableOpacity
          style={styles.item}
          onPress={() => router.push("/edit-profile")}
        >
          <View style={styles.row}>
            <Ionicons name="person-outline" size={22} color="#222" />
            <Text style={styles.itemText}>Edit Profile</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.item}
          onPress={() => router.push("/active-sessions")}
        >
          <View style={styles.row}>
            <Ionicons name="phone-portrait-outline" size={22} color="#222" />
            <Text style={styles.itemText}>Active Sessions</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>

        <TouchableOpacity
          style={styles.item}
          onPress={() => router.push("/notification-preferences")}
        >
          <View style={styles.row}>
            <Ionicons name="notifications-outline" size={22} color="#222" />
            <Text style={styles.itemText}>Notification Preferences</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subscription</Text>

        <TouchableOpacity
          style={styles.item}
          onPress={() => router.push("/subscription")}
        >
          <View style={styles.row}>
            <Ionicons name="card-outline" size={22} color="#222" />
            <Text style={styles.itemText}>Current Plan</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>

        <TouchableOpacity
          style={styles.logoutItem}
          onPress={() => router.push("/logout-confirmation")}
        >
          <View style={styles.row}>
            <Ionicons name="log-out-outline" size={22} color="#C44736" />
            <Text style={styles.logoutText}>Log Out</Text>
          </View>
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

  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
  },

  section: {
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginBottom: 10,
    marginLeft: 4,
  },

  item: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 10,
  },

  logoutItem: {
    backgroundColor: "#FCE8E6",
    borderRadius: 16,
    padding: 18,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  itemText: {
    marginLeft: 12,
    fontSize: 16,
  },

  logoutText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#C44736",
    fontWeight: "600",
  },
});

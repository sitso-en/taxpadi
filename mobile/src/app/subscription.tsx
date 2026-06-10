import { router } from "expo-router";

import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
export default function SubscriptionScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 30 }}
    >
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>⬅️ Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Current Plan</Text>

      <View style={styles.planCard}>
        <Text style={styles.planName}>Free Plan</Text>

        <Text style={styles.planDescription}>
          Basic tax management features
        </Text>
      </View>

      <TouchableOpacity
        style={styles.upgradeButton}
        onPress={() => alert("Upgrade feature coming soon")}
      >
        <Text style={styles.upgradeButtonText}>Upgrade Plan</Text>
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
    color: "#110503",
    marginTop: 50,
    marginBottom: 20,
  },

  planCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EBEBEB",
  },

  planName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#B83729",
  },

  planDescription: {
    marginTop: 8,
    color: "#666",
  },

  upgradeButton: {
    backgroundColor: "#B83729",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 30,
  },

  upgradeButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
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

import { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
export default function NotificationPreferencesScreen() {
  const [deadlineReminders, setDeadlineReminders] = useState(true);
  const [penaltyAlerts, setPenaltyAlerts] = useState(true);
  const [vaultSuggestions, setVaultSuggestions] = useState(true);
  const [referralOffers, setReferralOffers] = useState(true);
  const [paymentConfirmations, setPaymentConfirmations] = useState(true);
  const [systemUpdates, setSystemUpdates] = useState(true);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Notification Preferences</Text>

      <Text style={styles.subtitle}>
        Choose which notifications you want to receive
      </Text>
      <View style={styles.preferenceRow}>
        <View>
          <Text style={styles.preferenceTitle}>Deadline Reminders</Text>

          <Text style={styles.preferenceDescription}>
            Get notified about upcoming tax deadlines
          </Text>
        </View>

        <Switch
          value={deadlineReminders}
          onValueChange={setDeadlineReminders}
          trackColor={{ false: "#EBEBEB", true: "#B83729" }}
        />
      </View>
      <View style={styles.preferenceRow}>
        <View>
          <Text style={styles.preferenceTitle}>Penalty Alerts</Text>

          <Text style={styles.preferenceDescription}>
            Receive alerts when penalties may apply
          </Text>
        </View>

        <Switch
          value={penaltyAlerts}
          onValueChange={setPenaltyAlerts}
          trackColor={{ false: "#EBEBEB", true: "#B83729" }}
        />
      </View>
      <View style={styles.preferenceRow}>
        <View>
          <Text style={styles.preferenceTitle}>Vault Suggestions</Text>

          <Text style={styles.preferenceDescription}>
            Receive tax savings recommendations
          </Text>
        </View>

        <Switch
          value={vaultSuggestions}
          onValueChange={setVaultSuggestions}
          trackColor={{ false: "#EBEBEB", true: "#B83729" }}
        />
      </View>
      <View style={styles.preferenceRow}>
        <View>
          <Text style={styles.preferenceTitle}>Referral Offers</Text>

          <Text style={styles.preferenceDescription}>
            Receive referral rewards and offers
          </Text>
        </View>

        <Switch
          value={referralOffers}
          onValueChange={setReferralOffers}
          trackColor={{ false: "#EBEBEB", true: "#B83729" }}
        />
      </View>
      <View style={styles.preferenceRow}>
        <View>
          <Text style={styles.preferenceTitle}>Payment Confirmations</Text>

          <Text style={styles.preferenceDescription}>
            Receive confirmation for payments
          </Text>
        </View>

        <Switch
          value={paymentConfirmations}
          onValueChange={setPaymentConfirmations}
          trackColor={{ false: "#EBEBEB", true: "#B83729" }}
        />
      </View>
      <View style={styles.preferenceRow}>
        <View>
          <Text style={styles.preferenceTitle}>System Updates</Text>

          <Text style={styles.preferenceDescription}>
            Receive important system announcements
          </Text>
        </View>

        <Switch
          value={systemUpdates}
          onValueChange={setSystemUpdates}
          trackColor={{ false: "#EBEBEB", true: "#B83729" }}
        />
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => alert("Preferences saved successfully!")}
      >
        <Text style={styles.buttonText}>Save Preferences</Text>
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
  },

  subtitle: {
    marginTop: 10,
    fontSize: 16,
    color: "#1F1F1F",
  },
  preferenceRow: {
    marginTop: 30,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  preferenceTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#110503",
  },

  preferenceDescription: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },
  button: {
    backgroundColor: "#B83729",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 30,
    marginBottom: 30,
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});

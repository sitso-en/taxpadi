import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
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

  const PreferenceItem = ({
    title,
    description,
    value,
    onValueChange,
  }: any) => (
    <View style={styles.preferenceCard}>
      <View style={styles.preferenceContent}>
        <Text style={styles.preferenceTitle}>{title}</Text>

        <Text style={styles.preferenceDescription}>{description}</Text>
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: "#E5E7EB",
          true: "#A7F3D0",
        }}
        thumbColor="#FFFFFF"
      />
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/settings")}>
          <Ionicons name="chevron-back" size={28} color="#222" />
        </TouchableOpacity>

        <Text style={styles.title}>Notifications</Text>
      </View>

      <Text style={styles.subtitle}>
        Choose which notifications you want to receive.
      </Text>

      <PreferenceItem
        title="Deadline Reminders"
        description="Get notified about upcoming tax deadlines."
        value={deadlineReminders}
        onValueChange={setDeadlineReminders}
      />

      <PreferenceItem
        title="Penalty Alerts"
        description="Receive alerts when penalties may apply."
        value={penaltyAlerts}
        onValueChange={setPenaltyAlerts}
      />

      <PreferenceItem
        title="Vault Suggestions"
        description="Receive tax savings recommendations."
        value={vaultSuggestions}
        onValueChange={setVaultSuggestions}
      />

      <PreferenceItem
        title="Referral Offers"
        description="Receive referral rewards and offers."
        value={referralOffers}
        onValueChange={setReferralOffers}
      />

      <PreferenceItem
        title="Payment Confirmations"
        description="Receive payment confirmations."
        value={paymentConfirmations}
        onValueChange={setPaymentConfirmations}
      />

      <PreferenceItem
        title="System Updates"
        description="Receive important announcements."
        value={systemUpdates}
        onValueChange={setSystemUpdates}
      />

      <TouchableOpacity
        style={styles.saveButton}
        onPress={() => alert("Preferences saved successfully!")}
      >
        <Text style={styles.saveButtonText}>Save Preferences</Text>
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

  preferenceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  preferenceContent: {
    flex: 1,
    marginRight: 10,
  },

  preferenceTitle: {
    fontSize: 16,
    fontWeight: "600",
  },

  preferenceDescription: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },

  saveButton: {
    backgroundColor: "#C44736",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 12,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});

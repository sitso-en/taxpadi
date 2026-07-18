import React, { useEffect, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Toggle from "@/components/Toggle";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from "@/services/notification.service";
import { getUserFriendlyError } from "@/utils/error";
import { useToast } from "@/context/ToastContext";

type Prefs = {
  push_notifications: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  deadline_reminders: boolean;
  penalty_alerts: boolean;
  vault_suggestions: boolean;
  referral_offers: boolean;
  payment_confirmations: boolean;
  system_updates: boolean;
};

const defaultPrefs: Prefs = {
  push_notifications: true,
  email_notifications: true,
  sms_notifications: false,
  deadline_reminders: true,
  penalty_alerts: true,
  vault_suggestions: true,
  referral_offers: true,
  payment_confirmations: true,
  system_updates: true,
};

type Group = {
  title: string;
  subtitle: string;
  items: { key: keyof Prefs; label: string; description: string; icon: string }[];
};

const groups: Group[] = [
  {
    title: "CHANNELS",
    subtitle: "How you want to be notified",
    items: [
      { key: "push_notifications",  label: "Push Notifications", description: "Alerts sent directly to your device",     icon: "phone-portrait-outline" },
      { key: "email_notifications", label: "Email Notifications", description: "Summaries sent to your email address",   icon: "mail-outline" },
      { key: "sms_notifications",   label: "SMS Notifications",  description: "Text messages to your phone number",     icon: "chatbox-outline" },
    ],
  },
  {
    title: "ACTIVITY",
    subtitle: "What you want to be notified about",
    items: [
      { key: "deadline_reminders",    label: "Tax Deadlines",    description: "Reminders before GRA filing dates",      icon: "calendar-outline" },
      { key: "payment_confirmations", label: "Payment Updates",  description: "Confirmations and receipts",              icon: "card-outline" },
      { key: "penalty_alerts",        label: "Penalty Alerts",   description: "Warnings when penalties are issued",     icon: "warning-outline" },
      { key: "vault_suggestions",     label: "Savings Reminders", description: "Nudges to top up your savings vault",  icon: "wallet-outline" },
      { key: "referral_offers",       label: "Referral Offers",  description: "New partner and referral opportunities", icon: "gift-outline" },
      { key: "system_updates",        label: "System Updates",   description: "Important account and app notifications", icon: "megaphone-outline" },
    ],
  },
];

export default function NotificationPreferencesScreen() {
  const { showToast } = useToast();
  const [prefs, setPrefs] = useState<Prefs>(defaultPrefs);
  const [loading, setLoading] = useState(true);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getNotificationPreferences()
      .then((res) => {
        const data = res.data?.preferences ?? res.data ?? {};
        setPrefs({ ...defaultPrefs, ...data });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggle = (key: keyof Prefs) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] };

      // debounce — save 600ms after last toggle
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(async () => {
        try {
          await updateNotificationPreferences(next);
        } catch (error) {
          showToast(getUserFriendlyError(error), "error");
        }
      }, 600);

      return next;
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 60 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
      </View>

      <Text style={styles.subtitle}>
        Choose what TaxPadi notifies you about. Changes sync to your account instantly.
      </Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#C44736" />
        </View>
      ) : (
        groups.map((group) => (
          <View key={group.title} style={styles.group}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <Text style={styles.groupSubtitle}>{group.subtitle}</Text>
            <View style={styles.card}>
              {group.items.map((item, index) => (
                <View
                  key={item.key}
                  style={[styles.row, index < group.items.length - 1 && styles.rowBorder]}
                >
                  <View style={styles.iconWrap}>
                    <Ionicons name={item.icon as any} size={18} color="#C44736" />
                  </View>
                  <View style={styles.labelWrap}>
                    <Text style={styles.label}>{item.label}</Text>
                    <Text style={styles.description}>{item.description}</Text>
                  </View>
                  <Toggle value={prefs[item.key]} onValueChange={() => toggle(item.key)} />
                </View>
              ))}
            </View>
          </View>
        ))
      )}

      <Text style={styles.hint}>
        Notifications are delivered as push alerts to your device. Delivery also depends on your phone's system notification settings.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2EDE8",
    paddingHorizontal: 16,
    paddingTop: 44,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    color: "#111827",
    fontFamily: "Inter_700Bold",
    marginLeft: 10,
  },
  subtitle: {
    color: "#6B7280",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 24,
    lineHeight: 18,
  },
  loadingContainer: {
    paddingTop: 60,
    alignItems: "center",
  },
  group: {
    marginBottom: 24,
  },
  groupTitle: {
    color: "#C44736",
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  groupSubtitle: {
    color: "#9CA3AF",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ECECEC",
    overflow: "hidden",
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FFF5F3",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  labelWrap: {
    flex: 1,
  },
  label: {
    color: "#111827",
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  description: {
    color: "#9CA3AF",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  hint: {
    color: "#9CA3AF",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 16,
  },
});

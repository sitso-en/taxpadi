import React from "react";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useUser } from "../context/UserContext";

export default function SubscriptionScreen() {
  const { user, updateUser } = useUser();

  const isPro = user.subscription_tier !== "FREE";

  const freeFeatures = [
    "Transaction Tracking",
    "Tax Return Management",
    "Payment Tracking",
    "Reports & Analytics",
    "Invoice Management",
  ];

  const proFeatures = [
    "Everything in Free",
    "Unlimited Transactions",
    "Advanced Reports",
    "Priority Support",
    "AI Tax Insights",
    "Cloud Backup",
    "Export to PDF & CSV",
    "Premium Notifications",
  ];

  const handlePlanChange = () => {
    if (isPro) {
      Alert.alert(
        "Downgrade Plan",
        "Move back to the Free plan?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Downgrade",
            onPress: () => {
              updateUser({
                subscription_tier: "FREE",
              });

              Alert.alert(
                "Success",
                "You are now on the Free Plan."
              );
            },
          },
        ]
      );
    } else {
      Alert.alert(
        "Upgrade Plan",
        "Upgrade to the Pro plan?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Upgrade",
            onPress: () => {
              updateUser({
                subscription_tier: "PRO",
              });

              Alert.alert(
                "Success",
                "Welcome to TaxPadi Pro!"
              );
            },
          },
        ]
      );
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingBottom: 40,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Back */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.backButton}
      >
        <Ionicons
          name="arrow-back"
          size={24}
          color="#C44736"
        />
      </TouchableOpacity>

      <Text style={styles.title}>
        Subscription
      </Text>

      {/* Current Plan */}
      <View style={styles.planCard}>
        <Ionicons
          name={
            isPro
              ? "rocket-outline"
              : "card-outline"
          }
          size={32}
          color="#C44736"
        />

        <Text style={styles.planName}>
          {isPro ? "Pro Plan" : "Free Plan"}
        </Text>

        <Text style={styles.planDescription}>
          {isPro
            ? "Enjoy premium TaxPadi features with advanced analytics, exports and AI-powered tax assistance."
            : "Basic tax management features with transactions, tax returns, payments, invoices and reports."}
        </Text>

        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>
            CURRENT PLAN
          </Text>
        </View>
      </View>

      {/* Features */}
      <View style={styles.featuresCard}>
        <Text style={styles.sectionTitle}>
          Included Features
        </Text>

        {(isPro ? proFeatures : freeFeatures).map((feature) => (
          <View key={feature} style={styles.featureRow}>
            <Ionicons
              name="checkmark-circle"
              size={18}
              color="#34A853"
            />

            <Text style={styles.feature}>
              {feature}
            </Text>
          </View>
        ))}
      </View>

      {/* Action */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={handlePlanChange}
      >
        <Ionicons
          name={
            isPro
              ? "arrow-down-circle-outline"
              : "rocket-outline"
          }
          size={20}
          color="#FFFFFF"
        />

        <Text style={styles.actionButtonText}>
          {isPro ? "Downgrade to Free" : "Upgrade to Pro"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    padding: 20,
    paddingTop: 55,
  },

  backButton: {
    marginBottom: 15,
  },

  title: {
    fontSize: 30,
    color: "#111827",
    fontFamily: "Inter_700Bold",
    marginBottom: 20,
  },

  planCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
  },

  planName: {
    fontSize: 24,
    color: "#C44736",
    fontFamily: "Inter_700Bold",
    marginTop: 12,
  },

  planDescription: {
    color: "#6B7280",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 22,
    fontFamily: "Inter_400Regular",
  },

  statusBadge: {
    marginTop: 18,
    backgroundColor: "#FCE8E6",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },

  statusText: {
    color: "#C44736",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },

  featuresCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 18,
    color: "#111827",
    fontFamily: "Inter_700Bold",
    marginBottom: 16,
  },

  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  feature: {
    marginLeft: 10,
    color: "#111827",
    fontFamily: "Inter_400Regular",
  },

  actionButton: {
    backgroundColor: "#C44736",
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  actionButtonText: {
    color: "#FFFFFF",
    marginLeft: 8,
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
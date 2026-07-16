import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { getUserFriendlyError } from "@/utils/error";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ManagePlanScreen() {
  const selectPlan = (plan: string) => {
    Alert.alert(
      "Unavailable",
      "Subscription management is not yet available."
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingBottom: 40,
      }}
    >
      <TouchableOpacity
        onPress={() => router.back()}
      >
        <Ionicons
          name="chevron-back"
          size={26}
          color="#111827"
        />
      </TouchableOpacity>

      <Text style={styles.title}>
        Manage Plan
      </Text>

      <Text style={styles.subtitle}>
        Upgrade or downgrade your TaxPadi subscription.
      </Text>

      {[
        {
          name: "FREE",
          price: "GH¢0",
          color: "#6B7280",
        },
        {
          name: "PRO",
          price: "GH¢99/month",
          color: "#C44736",
        },
        {
          name: "BUSINESS",
          price: "GH¢199/month",
          color: "#34A853",
        },
      ].map((plan) => (
        <View
          key={plan.name}
          style={styles.card}
        >
          <Text
            style={[
              styles.plan,
              { color: plan.color },
            ]}
          >
            {plan.name}
          </Text>

          <Text style={styles.price}>
            {plan.price}
          </Text>

          <Text style={styles.description}>
            {plan.name === "FREE"
              ? "Basic tax management."
              : plan.name === "PRO"
              ? "Advanced tax tools for individuals."
              : "Business features and team support."}
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => selectPlan(plan.name)}
          >
            <Text style={styles.buttonText}>
              Select Plan
            </Text>
          </TouchableOpacity>
        </View>
      ))}
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

  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    marginTop: 20,
    color: "#111827",
  },

  subtitle: {
    marginTop: 2,
    marginBottom: 18,
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "Inter_400Regular",
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#ECECEC",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 2,
  },

  plan: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },

  price: {
    marginTop: 8,
    marginBottom: 20,
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#111827",
  },

  description: {
    marginTop: -10,
    marginBottom: 18,
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 18,
    fontFamily: "Inter_400Regular",
  },

  button: {
    backgroundColor: "#C44736",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
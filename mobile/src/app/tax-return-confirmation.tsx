import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function TaxReturnConfirmationScreen() {
  const { returnId } = useLocalSearchParams<{
    returnId: string;
  }>();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.iconCircle}>
        <Ionicons
          name="checkmark"
          size={60}
          color="#FFFFFF"
        />
      </View>

      <Text style={styles.title}>
        Return Submitted
      </Text>

      <Text style={styles.subtitle}>
        Your tax return has been submitted successfully.
      </Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Status</Text>
          <Text style={styles.value}>Successfully Submitted</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>Reference</Text>
          <Text style={styles.value}>
            {returnId ?? "Pending"}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>Next Step</Text>
          <Text style={styles.value}>Review payment status</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => router.push("/payments")}
      >
        <Text style={styles.primaryButtonText}>
          Pay Outstanding Tax
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => router.replace("/tax-returns")}
      >
        <Text style={styles.secondaryButtonText}>
          Back to Tax Returns
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 16,
    paddingTop: 44,
  },

  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#34A853",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },

  title: {
    marginTop: 24,
    fontSize: 34,
    color: "#111827",
    textAlign: "center",
    fontFamily: "Inter_700Bold",
  },

  subtitle: {
    marginTop: 4,
    marginBottom: 22,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    color: "#6B7280",
    fontFamily: "Inter_400Regular",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#ECECEC",
    marginBottom: 28,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 2,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 16,
  },

  label: {
    color: "#6B7280",
    fontFamily: "Inter_500Medium",
  },

  value: {
    color: "#111827",
    fontFamily: "Inter_600SemiBold",
  },

  primaryButton: {
    backgroundColor: "#C44736",
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: "center",
    marginBottom: 14,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },

  secondaryButton: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: "center",
  },

  secondaryButtonText: {
    color: "#111827",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTaxReturns } from "../context/TaxReturnsContext";

export default function TaxReturnReviewScreen() {
  const { returnId } = useLocalSearchParams<{
    returnId: string;
  }>();

  const { fileCurrentReturn } = useTaxReturns();

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (loading) return;

    setLoading(true);

    try {
      await fileCurrentReturn();

      router.replace("/tax-return-confirmation" as never);
    } catch (error: any) {
      Alert.alert(
        "Submission Failed",
        error?.response?.data?.message ??
          "Unable to submit tax return."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name="chevron-back"
            size={26}
            color="#111827"
          />
        </TouchableOpacity>

        <Text style={styles.title}>
          Review Return
        </Text>
      </View>

      <Text style={styles.subtitle}>
        Review your tax return before submission.
      </Text>

      <View style={styles.card}>
        <Row
          label="Tax Type"
          value="Income Tax"
        />

        <Divider />

        <Row
          label="Tax Year"
          value="2026"
        />

        <Divider />

        <Row
          label="Estimated Liability"
          value="GH¢ 4,280.00"
        />

        <Divider />

        <Row
          label="Status"
          value="Draft"
        />
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Submitting..." : "Submit Tax Return"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 20,
    paddingTop: 55,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },

  title: {
    marginLeft: 10,
    fontSize: 30,
    color: "#111827",
    fontFamily: "Inter_700Bold",
  },

  subtitle: {
    color: "#6B7280",
    marginBottom: 24,
    fontFamily: "Inter_400Regular",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "#ECECEC",
    marginBottom: 30,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  label: {
    color: "#6B7280",
    fontFamily: "Inter_500Medium",
  },

  value: {
    color: "#111827",
    fontFamily: "Inter_600SemiBold",
  },

  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 16,
  },

  button: {
    backgroundColor: "#C44736",
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function PAYEScreen() {
  const Row = ({
    label,
    value,
  }: {
    label: string;
    value: string;
  }) => (
    <>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
      <View style={styles.divider} />
    </>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>

        <Text style={styles.title}>PAYE</Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>OUTSTANDING PAYE</Text>
        <Text style={styles.summaryAmount}>GH¢ 1,240.00</Text>
      </View>

      <View style={styles.infoCard}>
        <Row label="PAYE Due" value="GH¢ 3,500.00" />
        <Row label="PAYE Paid" value="GH¢ 2,260.00" />
        <Row label="Outstanding PAYE" value="GH¢ 1,240.00" />
      </View>

      <Text style={styles.section}>PAYE HISTORY</Text>

      {[
        {
          month: "June 2026",
          amount: "GH¢ 620.00",
        },
        {
          month: "May 2026",
          amount: "GH¢ 580.00",
        },
        {
          month: "April 2026",
          amount: "GH¢ 530.00",
        },
      ].map((item, index) => (
        <View key={index} style={styles.historyCard}>
          <View>
            <Text style={styles.historyTitle}>
              {item.month}
            </Text>
            <Text style={styles.historyStatus}>
              Paid
            </Text>
          </View>

          <Text style={styles.historyAmount}>
            {item.amount}
          </Text>
        </View>
      ))}

      <TouchableOpacity
  style={styles.button}
  onPress={() => router.push("/payments")}
>
        <Text style={styles.buttonText}>
          Remit PAYE
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
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
    fontSize: 30,
    marginLeft: 12,
    color: "#111827",
    fontFamily: "Inter_700Bold",
  },

  summaryCard: {
    backgroundColor: "#C44736",
    borderRadius: 20,
    padding: 24,
    marginBottom: 22,
  },

  summaryLabel: {
    color: "#FDECEC",
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },

  summaryAmount: {
    color: "#FFFFFF",
    fontSize: 34,
    marginTop: 10,
    fontFamily: "Inter_700Bold",
  },

  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 24,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
  },

  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
  },

  label: {
    color: "#6B7280",
    fontFamily: "Inter_500Medium",
  },

  value: {
    color: "#111827",
    fontFamily: "Inter_600SemiBold",
  },

  section: {
    fontSize: 18,
    color: "#111827",
    fontFamily: "Inter_700Bold",
    marginBottom: 14,
  },

  historyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  historyTitle: {
    color: "#111827",
    fontFamily: "Inter_600SemiBold",
  },

  historyStatus: {
    color: "#16A34A",
    marginTop: 4,
  },

  historyAmount: {
    color: "#111827",
    fontFamily: "Inter_700Bold",
  },

  button: {
    backgroundColor: "#C44736",
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 20,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
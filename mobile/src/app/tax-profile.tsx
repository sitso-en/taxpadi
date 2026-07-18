import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useTaxLiability } from "@/context/TaxLiabilityContext";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  }).format(value ?? 0);

export default function TaxScreen() {
  const { liability, loading } = useTaxLiability();
  const [selectedTab, setSelectedTab] = useState("Overview");

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#C44736" />
      </View>
    );
  }

  const vat = liability?.breakdown?.vat ?? 0;
  const paye = liability?.breakdown?.paye ?? 0;
  const incomeTax = liability?.breakdown?.income_tax ?? 0;
  const total = liability?.tax_liability ?? 0;

  const vatPct = total > 0 ? (vat / total) * 100 : 0;
  const payePct = total > 0 ? (paye / total) * 100 : 0;
  const incomeTaxPct = total > 0 ? (incomeTax / total) * 100 : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 48 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Taxes</Text>
      </View>

      {/* Liability Card */}
      <View style={styles.taxCard}>
        <Text style={styles.taxLabel}>TOTAL TAX LIABILITY</Text>
        <Text style={styles.taxAmount}>{formatCurrency(liability?.net_liability ?? 0)}</Text>
        {liability?.next_deadline && (
          <Text style={styles.taxSubtext}>
            Due on{" "}
            {new Date(liability.next_deadline).toLocaleDateString("en-GH", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </Text>
        )}
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 16 }}
      >
        {["Overview", "VAT", "PAYE", "Withholding"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, selectedTab === tab && styles.selectedTab]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === tab && styles.selectedTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tax Breakdown */}
      <Text style={styles.sectionTitle}>Tax Breakdown</Text>

      <View style={styles.breakdownCard}>
        {[
          { label: "VAT", value: vat, pct: vatPct },
          { label: "PAYE", value: paye, pct: payePct },
          { label: "Income Tax", value: incomeTax, pct: incomeTaxPct },
        ].map(({ label, value, pct }) => (
          <View key={label}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>{label}</Text>
              <Text style={styles.breakdownValue}>{formatCurrency(value)}</Text>
            </View>
            <View style={styles.progressBackground}>
              <View
                style={[styles.progressFill, { width: `${Math.min(100, pct)}%` }]}
              />
            </View>
          </View>
        ))}
      </View>

      {/* Summary Row */}
      <View style={styles.breakdownCard}>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Taxable Income</Text>
          <Text style={styles.breakdownValue}>
            {formatCurrency(liability?.taxable_income ?? 0)}
          </Text>
        </View>
        <View style={[styles.breakdownRow, { marginTop: 8 }]}>
          <Text style={styles.breakdownLabel}>Total Paid</Text>
          <Text style={[styles.breakdownValue, { color: "#34A853" }]}>
            {formatCurrency(liability?.total_amount_paid ?? 0)}
          </Text>
        </View>
      </View>

      {/* File Return Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/tax-returns")}
      >
        <Text style={styles.buttonText}>File Tax Return</Text>
      </TouchableOpacity>
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

  centered: {
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 24,
    marginLeft: 10,
    color: "#111827",
    fontFamily: "Inter_700Bold",
  },

  taxCard: {
    backgroundColor: "#C44736",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },

  taxLabel: {
    color: "#FDECEC",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },

  taxAmount: {
    color: "#FFFFFF",
    fontSize: 36,
    marginTop: 8,
    fontFamily: "Inter_700Bold",
  },

  taxSubtext: {
    color: "#FDECEC",
    marginTop: 8,
    fontFamily: "Inter_400Regular",
  },

  tabButton: {
    backgroundColor: "#EDE8E3",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
  },

  selectedTab: {
    backgroundColor: "#C44736",
  },

  tabText: {
    color: "#111827",
    fontFamily: "Inter_500Medium",
  },

  selectedTabText: {
    color: "#FFFFFF",
  },

  sectionTitle: {
    fontSize: 16,
    color: "#111827",
    marginBottom: 12,
    fontFamily: "Inter_700Bold",
  },

  breakdownCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },

  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  breakdownLabel: {
    color: "#111827",
    fontFamily: "Inter_500Medium",
  },

  breakdownValue: {
    color: "#111827",
    fontFamily: "Inter_700Bold",
  },

  progressBackground: {
    height: 8,
    backgroundColor: "#EDE8E3",
    borderRadius: 20,
    marginBottom: 18,
  },

  progressFill: {
    height: 8,
    backgroundColor: "#C44736",
    borderRadius: 20,
  },

  button: {
    backgroundColor: "#C44736",
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function TaxScreen() {
  const [selectedTab, setSelectedTab] = useState("Overview");

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name="arrow-back"
            size={24}
            color="#111827"
          />
        </TouchableOpacity>

        <Text style={styles.title}>Taxes</Text>
      </View>

      {/* Liability Card */}
      <View style={styles.taxCard}>
        <Text style={styles.taxLabel}>
          TOTAL TAX LIABILITY
        </Text>

        <Text style={styles.taxAmount}>
          GH¢ 4,280.00
        </Text>

        <Text style={styles.taxSubtext}>
          Due on June 30, 2026
        </Text>
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 24 }}
      >
        {[
          "Overview",
          "VAT",
          "PAYE",
          "Withholding",
        ].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              selectedTab === tab && styles.selectedTab,
            ]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === tab &&
                  styles.selectedTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tax Breakdown */}
      <Text style={styles.sectionTitle}>
        Tax Breakdown
      </Text>

      <View style={styles.breakdownCard}>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>
            VAT
          </Text>

          <Text style={styles.breakdownValue}>
            GH¢ 1,840
          </Text>
        </View>

        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progressFill,
              { width: "60%" },
            ]}
          />
        </View>

        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>
            PAYE
          </Text>

          <Text style={styles.breakdownValue}>
            GH¢ 640
          </Text>
        </View>

        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progressFill,
              { width: "25%" },
            ]}
          />
        </View>

        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>
            Income Tax
          </Text>

          <Text style={styles.breakdownValue}>
            GH¢ 1,800
          </Text>
        </View>

        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progressFill,
              { width: "50%" },
            ]}
          />
        </View>
      </View>

      {/* Warning Card */}
      <View style={styles.warningCard}>
        <Ionicons
          name="warning-outline"
          size={24}
          color="#C44736"
        />

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.warningTitle}>
            VAT Return Pending
          </Text>

          <Text style={styles.warningText}>
            Your VAT filing deadline is approaching.
          </Text>
        </View>
      </View>

      {/* File Return Button */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>
          File Tax Return
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

  taxCard: {
    backgroundColor: "#C44736",
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
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
    backgroundColor: "#F3F4F6",
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
    fontSize: 20,
    color: "#111827",
    marginBottom: 16,
    fontFamily: "Inter_700Bold",
  },

  breakdownCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
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
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    marginBottom: 18,
  },

  progressFill: {
    height: 8,
    backgroundColor: "#C44736",
    borderRadius: 20,
  },

  warningCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },

  warningTitle: {
    color: "#111827",
    fontFamily: "Inter_600SemiBold",
  },

  warningText: {
    color: "#6B7280",
    marginTop: 4,
    fontFamily: "Inter_400Regular",
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
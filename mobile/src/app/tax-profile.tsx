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
import { getTaxLiabilityByType } from "@/services/tax.service";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
  }).format(value ?? 0);

const TAB_TYPE_MAP: Record<string, string> = {
  VAT: "vat",
  PAYE: "paye",
  Withholding: "withholding",
};

export default function TaxScreen() {
  const { liability, loading } = useTaxLiability();
  const [selectedTab, setSelectedTab] = useState("Overview");
  const [tabDetail, setTabDetail] = useState<any>(null);
  const [tabLoading, setTabLoading] = useState(false);
  const [tabNoData, setTabNoData] = useState(false);

  const handleTabChange = async (tab: string) => {
    setSelectedTab(tab);
    if (tab === "Overview") {
      setTabDetail(null);
      setTabNoData(false);
      return;
    }
    setTabDetail(null);
    setTabNoData(false);
    setTabLoading(true);
    try {
      const res = await getTaxLiabilityByType(TAB_TYPE_MAP[tab]);
      setTabDetail(res.data ?? res);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 404 || status === 422) setTabNoData(true);
    } finally {
      setTabLoading(false);
    }
  };

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
            onPress={() => handleTabChange(tab)}
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

      {selectedTab === "Overview" ? (
        <>
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
                  <View style={[styles.progressFill, { width: `${Math.min(100, pct)}%` }]} />
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
        </>
      ) : tabLoading ? (
        <ActivityIndicator size="large" color="#C44736" style={{ marginTop: 40 }} />
      ) : tabNoData ? (
        <View style={styles.emptyCard}>
          <Ionicons name="document-outline" size={44} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No data yet</Text>
          <Text style={styles.emptySubtitle}>
            {selectedTab} records will appear here once transactions are logged and calculations are run.
          </Text>
        </View>
      ) : tabDetail ? (
        <>
          <Text style={styles.sectionTitle}>{selectedTab} Breakdown</Text>
          <View style={styles.breakdownCard}>
            {[
              { label: "Gross Income", value: tabDetail.gross_income ?? 0 },
              { label: "Deductions", value: tabDetail.total_deductions ?? 0 },
              { label: "Taxable Amount", value: tabDetail.taxable_income ?? 0 },
              { label: "Tax Liability", value: tabDetail.tax_liability ?? 0 },
            ].map(({ label, value }, i) => (
              <View key={label}>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>{label}</Text>
                  <Text style={[
                    styles.breakdownValue,
                    label === "Tax Liability" && { color: "#C44736" },
                  ]}>
                    {formatCurrency(value)}
                  </Text>
                </View>
                {i < 3 && <View style={{ height: 1, backgroundColor: "#EDE8E3", marginBottom: 8 }} />}
              </View>
            ))}
          </View>
          {tabDetail.period_start && (
            <Text style={styles.periodNote}>
              Period: {new Date(tabDetail.period_start).toLocaleDateString("en-GH", { month: "long", year: "numeric" })}
              {tabDetail.period_end && tabDetail.period_end !== tabDetail.period_start
                ? ` – ${new Date(tabDetail.period_end).toLocaleDateString("en-GH", { month: "long", year: "numeric" })}`
                : ""}
            </Text>
          )}
        </>
      ) : null}

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

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  emptyTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#111827",
    marginTop: 14,
    marginBottom: 6,
  },

  emptySubtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 18,
  },

  periodNote: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
    textAlign: "center",
    marginBottom: 16,
  },
});

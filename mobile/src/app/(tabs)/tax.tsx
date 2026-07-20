import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getTaxLiability, getTaxRates } from "@/services/tax.service";
import { useTaxLiability } from "@/context/TaxLiabilityContext";
import { usePrivacy } from "@/context/PrivacyContext";

const fmt = (n: number) =>
  `GH¢ ${Number(n).toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const TABS = ["Overview", "Income Tax", "VAT", "PAYE", "Withholding"] as const;
type Tab = (typeof TABS)[number];

const CURRENT_YEAR = new Date().getFullYear();

export default function TaxScreen() {
  const { amountsHidden, toggleAmountsHidden } = usePrivacy();
  const { liability: contextLiability, loading: contextLoading } = useTaxLiability();
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [rates, setRates] = useState<any>(null);
  const [ratesLoading, setRatesLoading] = useState(true);

  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [yearLiability, setYearLiability] = useState<any>(null);
  const [yearLoading, setYearLoading] = useState(false);

  // Use context data for current year, fetch separately for other years
  const liability = selectedYear === CURRENT_YEAR ? contextLiability : yearLiability;
  const loading = (selectedYear === CURRENT_YEAR ? contextLoading : yearLoading) || ratesLoading;

  useEffect(() => {
    const load = async () => {
      try {
        const ratesRes = await getTaxRates();
        setRates(ratesRes.data);
      } catch {
        // silently fail — UI shows dashes
      } finally {
        setRatesLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (selectedYear === CURRENT_YEAR) return;
    const fetchYear = async () => {
      setYearLoading(true);
      try {
        const res = await getTaxLiability(selectedYear);
        setYearLiability(res.data ?? res);
      } catch {
        setYearLiability(null);
      } finally {
        setYearLoading(false);
      }
    };
    fetchYear();
  }, [selectedYear]);

  const netDue = Number(liability?.net_liability ?? 0);
  const totalLiability = Number(liability?.total_liability ?? 0);
  const totalPaid = Number(liability?.total_amount_paid ?? 0);
  const breakdown: any[] = Array.isArray(liability?.breakdown) ? liability.breakdown : [];
  const paidPct = totalLiability > 0 ? Math.min(totalPaid / totalLiability, 1) : 0;

  const vat = rates?.vat;
  const incomeTax = rates?.income_tax;
  const paye = rates?.paye;
  const withholding = rates?.withholding;
  const penalties = rates?.penalties;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Taxes</Text>
            <Text style={styles.subtitle}>GRA rates & your obligations</Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/tax-returns")} style={styles.fileBtn}>
            <Ionicons name="document-text-outline" size={16} color="#C44736" />
            <Text style={styles.fileBtnText}>File Return</Text>
          </TouchableOpacity>
        </View>

        {/* Hero gradient card */}
        <LinearGradient
          colors={["#C44736", "#8B2318"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          {/* Decorative arcs */}
          <View style={styles.arcOuter} />
          <View style={styles.arcInner} />

          {/* Top row: label + eye toggle */}
          <View style={styles.heroTopRow}>
            <Text style={styles.heroLabel}>NET TAX DUE</Text>
            <TouchableOpacity onPress={toggleAmountsHidden} style={styles.eyeBtn}>
              <Ionicons
                name={amountsHidden ? "eye-off-outline" : "eye-outline"}
                size={18}
                color="rgba(255,255,255,0.8)"
              />
            </TouchableOpacity>
          </View>

          {/* Amount */}
          {loading ? (
            <ActivityIndicator color="#FFFFFF" style={{ marginVertical: 10 }} />
          ) : (
            <Text style={styles.heroAmount}>
              {amountsHidden ? "••••••••" : fmt(netDue)}
            </Text>
          )}

          {/* Year selector */}
          <View style={styles.yearRow}>
            <TouchableOpacity
              onPress={() => setSelectedYear((y) => y - 1)}
              style={styles.yearArrow}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="chevron-back" size={14} color="rgba(255,255,255,0.75)" />
            </TouchableOpacity>
            <Text style={styles.heroYear}>{selectedYear} tax year</Text>
            <TouchableOpacity
              onPress={() => setSelectedYear((y) => Math.min(y + 1, CURRENT_YEAR))}
              style={styles.yearArrow}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              disabled={selectedYear >= CURRENT_YEAR}
            >
              <Ionicons
                name="chevron-forward"
                size={14}
                color={selectedYear >= CURRENT_YEAR ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.75)"}
              />
            </TouchableOpacity>
          </View>

          {/* Progress bar */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.round(paidPct * 100)}%` }]} />
          </View>
          <Text style={styles.progressLabel}>
            {Math.round(paidPct * 100)}% paid
          </Text>

          {/* 3-stat row */}
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Liability</Text>
              <Text style={styles.statValue}>
                {amountsHidden ? "••••••" : fmt(totalLiability)}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Paid</Text>
              <Text style={[styles.statValue, { color: "#86efac" }]}>
                {amountsHidden ? "••••••" : fmt(totalPaid)}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Remaining</Text>
              <Text style={[styles.statValue, { color: "#fca5a5" }]}>
                {amountsHidden ? "••••••" : fmt(Math.max(netDue, 0))}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
          style={styles.tabsContainer}
        >
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Overview */}
        {activeTab === "Overview" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Breakdown by Tax Type</Text>
            {loading ? (
              <ActivityIndicator color="#C44736" style={{ paddingVertical: 20 }} />
            ) : breakdown.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="calculator-outline" size={32} color="#D1C7BF" />
                <Text style={styles.emptyText}>
                  No calculations yet. Add transactions to get started.
                </Text>
              </View>
            ) : (
              breakdown.map((item, i) => (
                <View
                  key={i}
                  style={[styles.breakdownRow, i < breakdown.length - 1 && styles.rowBorder]}
                >
                  <View style={styles.breakdownLeft}>
                    <View style={styles.breakdownDot} />
                    <View>
                      <Text style={styles.breakdownLabel}>
                        {item.tax_type?.replace(/_/g, " ")}
                      </Text>
                      <Text style={styles.breakdownMeta}>
                        Taxable: {amountsHidden ? "••••••" : fmt(item.taxable_income ?? 0)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.breakdownAmount}>
                    {amountsHidden ? "••••••" : fmt(item.tax_liability ?? 0)}
                  </Text>
                </View>
              ))
            )}

            {!loading && (
              <View style={styles.summaryBlock}>
                <SummaryRow label="Total Liability" value={amountsHidden ? "••••••" : fmt(totalLiability)} />
                <SummaryRow label="Amount Paid" value={amountsHidden ? "••••••" : fmt(totalPaid)} valueColor="#16A34A" />
                <View style={styles.summaryDivider} />
                <SummaryRow
                  label="Net Due"
                  value={amountsHidden ? "••••••" : fmt(netDue)}
                  valueColor="#C44736"
                  bold
                />
              </View>
            )}
          </View>
        )}

        {/* Income Tax */}
        {activeTab === "Income Tax" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Income Tax Brackets</Text>
            <Text style={styles.cardSubtitle}>Ghana Revenue Authority</Text>
            {loading ? (
              <ActivityIndicator color="#C44736" style={{ paddingVertical: 20 }} />
            ) : !incomeTax ? (
              <EmptyRates />
            ) : (
              <>
                <BracketTable
                  headers={["Income Range", "Rate"]}
                  rows={(incomeTax.brackets ?? []).map((b: any) => [
                    b.to
                      ? `GH¢ ${Number(b.from).toLocaleString()} – ${Number(b.to).toLocaleString()}`
                      : `Above GH¢ ${Number(b.from).toLocaleString()}`,
                    b.rate,
                  ])}
                />
                <View style={styles.metaChip}>
                  <Ionicons name="calendar-outline" size={13} color="#6B7280" />
                  <Text style={styles.metaChipText}>Filing deadline: {incomeTax.filing_deadline}</Text>
                </View>
              </>
            )}
          </View>
        )}

        {/* VAT */}
        {activeTab === "VAT" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Value Added Tax</Text>
            <Text style={styles.cardSubtitle}>Ghana Revenue Authority</Text>
            {loading ? (
              <ActivityIndicator color="#C44736" style={{ paddingVertical: 20 }} />
            ) : !vat ? (
              <EmptyRates />
            ) : (
              <>
                <InfoRow label="Standard Rate" value={vat.standard_rate} />
                <InfoRow label="NHIL Levy" value={vat.nhil_levy} />
                <InfoRow label="GETFund Levy" value={vat.getfund_levy} />
                <InfoRow label="Effective Rate" value={vat.effective_rate} highlight />
                <InfoRow
                  label="Threshold (Goods)"
                  value={`GH¢ ${Number(vat.registration_threshold_goods ?? 0).toLocaleString()}`}
                />
                <InfoRow label="Threshold (Services)" value={vat.registration_threshold_services} />
                <InfoRow label="Filing Frequency" value={vat.filing_frequency} />
                <InfoRow label="Filing Deadline" value={vat.filing_deadline} />
              </>
            )}
          </View>
        )}

        {/* PAYE */}
        {activeTab === "PAYE" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>PAYE Brackets</Text>
            <Text style={styles.cardSubtitle}>Ghana Revenue Authority</Text>
            {loading ? (
              <ActivityIndicator color="#C44736" style={{ paddingVertical: 20 }} />
            ) : !paye ? (
              <EmptyRates />
            ) : (
              <>
                <BracketTable
                  headers={["Monthly Income", "Rate"]}
                  rows={(paye.brackets ?? []).map((b: any) => [
                    b.to
                      ? `GH¢ ${Number(b.from).toLocaleString()} – ${Number(b.to).toLocaleString()}`
                      : `Above GH¢ ${Number(b.from).toLocaleString()}`,
                    b.rate,
                  ])}
                />
                <View style={styles.metaChip}>
                  <Ionicons name="calendar-outline" size={13} color="#6B7280" />
                  <Text style={styles.metaChipText}>Remittance: {paye.remittance_deadline}</Text>
                </View>
                <View style={[styles.metaChip, { marginTop: 6 }]}>
                  <Ionicons name="calendar-outline" size={13} color="#6B7280" />
                  <Text style={styles.metaChipText}>Annual return: {paye.annual_return_deadline}</Text>
                </View>
              </>
            )}
          </View>
        )}

        {/* Withholding */}
        {activeTab === "Withholding" && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Withholding Tax Rates</Text>
            <Text style={styles.cardSubtitle}>Ghana Revenue Authority</Text>
            {loading ? (
              <ActivityIndicator color="#C44736" style={{ paddingVertical: 20 }} />
            ) : !withholding ? (
              <EmptyRates />
            ) : (
              <BracketTable
                headers={["Category", "Rate"]}
                colFlex={[3, 1]}
                rows={(withholding.rates ?? []).map((r: any) => [r.category, r.rate])}
              />
            )}
          </View>
        )}

        {/* Penalties card (all rate tabs) */}
        {!loading && penalties && activeTab !== "Overview" && (
          <View style={styles.penaltyCard}>
            <View style={styles.penaltyIcon}>
              <Ionicons name="alert-circle-outline" size={18} color="#92400E" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.penaltyTitle}>Late Payment Penalties</Text>
              <Text style={styles.penaltyText}>Late payment: {penalties.late_payment_rate}</Text>
              <Text style={styles.penaltyText}>PAYE late remittance: {penalties.paye_late_remittance}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ── Sub-components ────────────────────────────────────────── */

function SummaryRow({
  label,
  value,
  valueColor,
  bold,
}: {
  label: string;
  value: string;
  valueColor?: string;
  bold?: boolean;
}) {
  return (
    <View style={srStyles.row}>
      <Text style={[srStyles.label, bold && srStyles.bold]}>{label}</Text>
      <Text style={[srStyles.value, bold && srStyles.bold, valueColor ? { color: valueColor } : {}]}>
        {value}
      </Text>
    </View>
  );
}

const srStyles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  label: { color: "#6B7280", fontFamily: "Inter_400Regular", fontSize: 13 },
  value: { color: "#111827", fontFamily: "Inter_600SemiBold", fontSize: 13 },
  bold: { fontFamily: "Inter_700Bold" },
});

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={irStyles.row}>
      <Text style={irStyles.label}>{label}</Text>
      <Text style={[irStyles.value, highlight && irStyles.highlight]}>{value ?? "—"}</Text>
    </View>
  );
}

const irStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#EDE8E3",
  },
  label: { color: "#6B7280", fontFamily: "Inter_400Regular", fontSize: 13, flex: 1, marginRight: 8 },
  value: { color: "#111827", fontFamily: "Inter_600SemiBold", fontSize: 13 },
  highlight: { color: "#C44736", fontFamily: "Inter_700Bold" },
});

function BracketTable({
  headers,
  rows,
  colFlex,
}: {
  headers: [string, string];
  rows: [string, string][];
  colFlex?: [number, number];
}) {
  const [f0, f1] = colFlex ?? [2, 1];
  return (
    <>
      <View style={btStyles.header}>
        <Text style={[btStyles.headerText, { flex: f0 }]}>{headers[0]}</Text>
        <Text style={[btStyles.headerText, { flex: f1, textAlign: "right" }]}>{headers[1]}</Text>
      </View>
      {rows.map(([left, right], i) => (
        <View key={i} style={[btStyles.row, i % 2 === 1 && btStyles.rowAlt]}>
          <Text style={[btStyles.cell, { flex: f0 }]}>{left}</Text>
          <Text style={[btStyles.cell, btStyles.rate, { flex: f1 }]}>{right}</Text>
        </View>
      ))}
    </>
  );
}

const btStyles = StyleSheet.create({
  header: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 8,
    marginBottom: 4,
  },
  headerText: {
    color: "#9CA3AF",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  row: { flexDirection: "row", paddingVertical: 10, paddingHorizontal: 4, borderRadius: 6 },
  rowAlt: { backgroundColor: "#F2EDE8" },
  cell: { color: "#111827", fontFamily: "Inter_400Regular", fontSize: 13 },
  rate: { fontFamily: "Inter_700Bold", color: "#C44736", textAlign: "right" },
});

function EmptyRates() {
  return (
    <View style={{ alignItems: "center", paddingVertical: 24 }}>
      <Ionicons name="cloud-offline-outline" size={28} color="#D1C7BF" />
      <Text style={{ color: "#9CA3AF", fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 8 }}>
        Rates unavailable.
      </Text>
    </View>
  );
}

/* ── Styles ────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F2EDE8",
  },

  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  title: {
    fontSize: 32,
    color: "#111827",
    fontFamily: "Inter_700Bold",
  },

  subtitle: {
    color: "#9CA3AF",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },

  fileBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFF5F3",
    borderWidth: 1,
    borderColor: "#F8C5BF",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },

  fileBtnText: {
    color: "#C44736",
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },

  /* Hero card */
  heroCard: {
    borderRadius: 24,
    padding: 22,
    marginBottom: 20,
    overflow: "hidden",
    shadowColor: "#C44736",
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },

  arcOuter: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 40,
    borderColor: "rgba(255,255,255,0.07)",
    right: -60,
    top: -60,
  },

  arcInner: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 30,
    borderColor: "rgba(255,255,255,0.07)",
    right: -10,
    top: 60,
  },

  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  heroLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.8,
  },

  eyeBtn: {
    padding: 4,
  },

  heroAmount: {
    color: "#FFFFFF",
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    marginBottom: 4,
  },

  yearRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },

  yearArrow: {
    padding: 2,
  },

  heroYear: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },

  progressTrack: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 3,
    marginBottom: 6,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 3,
  },

  progressLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    marginBottom: 18,
  },

  statRow: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.18)",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 6,
  },

  statItem: {
    flex: 1,
    alignItems: "center",
  },

  statDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginVertical: 4,
  },

  statLabel: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    marginBottom: 4,
    letterSpacing: 0.3,
  },

  statValue: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "Inter_700Bold",
  },

  /* Tabs */
  tabsContainer: {
    marginBottom: 16,
  },

  tabsContent: {
    paddingRight: 8,
    gap: 8,
  },

  tabButton: {
    backgroundColor: "#EDE8E3",
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 24,
  },

  activeTabButton: {
    backgroundColor: "#C44736",
    shadowColor: "#C44736",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  tabText: {
    color: "#6B7280",
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },

  activeTabText: {
    color: "#FFFFFF",
  },

  /* Content card */
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  cardTitle: {
    fontSize: 16,
    color: "#111827",
    fontFamily: "Inter_700Bold",
    marginBottom: 2,
  },

  cardSubtitle: {
    fontSize: 12,
    color: "#9CA3AF",
    fontFamily: "Inter_400Regular",
    marginBottom: 15,
  },

  /* Overview breakdown rows */
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },

  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  breakdownLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 10,
  },

  breakdownDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#C44736",
  },

  breakdownLabel: {
    color: "#111827",
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    textTransform: "capitalize",
  },

  breakdownMeta: {
    color: "#9CA3AF",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },

  breakdownAmount: {
    color: "#111827",
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },

  summaryBlock: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },

  summaryDivider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 8,
  },

  emptyBox: {
    alignItems: "center",
    paddingVertical: 28,
    gap: 10,
  },

  emptyText: {
    color: "#9CA3AF",
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    textAlign: "center",
    maxWidth: 220,
    lineHeight: 20,
  },

  /* Meta chips */
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F2EDE8",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginTop: 14,
    alignSelf: "flex-start",
  },

  metaChipText: {
    color: "#6B7280",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },

  /* Penalty card */
  penaltyCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "#FFFBEB",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },

  penaltyIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
  },

  penaltyTitle: {
    color: "#92400E",
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    marginBottom: 4,
  },

  penaltyText: {
    color: "#78350F",
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
    lineHeight: 18,
  },
});

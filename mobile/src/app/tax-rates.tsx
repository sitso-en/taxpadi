import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getTaxRates } from "@/services/tax.service";

export default function TaxRatesScreen() {
  const [rates, setRates] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTaxRates()
      .then((res) => setRates(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const incomeTax = rates?.income_tax;
  const vat = rates?.vat;
  const paye = rates?.paye;
  const withholding = rates?.withholding;
  const penalties = rates?.penalties;
  const taxYear = rates?.tax_year ?? new Date().getFullYear();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 48 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Ghana Tax Rates</Text>
      </View>
      <Text style={styles.subtitle}>GRA official rates · {taxYear} tax year</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#C44736" style={{ marginTop: 60 }} />
      ) : !rates ? (
        <View style={styles.errorBox}>
          <Ionicons name="cloud-offline-outline" size={40} color="#9CA3AF" />
          <Text style={styles.errorText}>Could not load rates. Check your connection.</Text>
        </View>
      ) : (
        <>
          {/* ── INCOME TAX ─────────────────────────── */}
          <Section
            icon="trending-up-outline"
            title="Personal Income Tax"
            description={`Ghana uses a progressive tax system for personal income. You only pay the higher rate on the portion of income that falls within each bracket — not on your entire income.\n\nFor example, if you earn GH¢ 10,000/year, the first GH¢ ${fmt(incomeTax?.brackets?.[0]?.to ?? 5520)} is tax-free, the next portion is taxed at the next bracket's rate, and so on.`}
          >
            <BracketTable brackets={incomeTax?.brackets ?? []} label="Annual Income (GH¢)" />
            <Deadline icon="calendar-outline" label="Filing Deadline" value={incomeTax?.filing_deadline} />
          </Section>

          {/* ── VAT ────────────────────────────────── */}
          <Section
            icon="storefront-outline"
            title="Value Added Tax (VAT)"
            description={`VAT is charged on the supply of goods and services. Businesses with annual turnover above GH¢ ${Number(vat?.registration_threshold_goods ?? 200000).toLocaleString()} must register for VAT.\n\nThe rate you see on receipts is the effective rate of ${vat?.effective_rate ?? "19.25%"}, which combines the standard VAT with the NHIL and GETFund levies.`}
          >
            <InfoRow label="Standard VAT Rate" value={vat?.standard_rate} />
            <InfoRow label="NHIL Levy" value={vat?.nhil_levy} note="National Health Insurance Levy" />
            <InfoRow label="GETFund Levy" value={vat?.getfund_levy} note="Ghana Education Trust Fund" />
            <InfoRow label="Effective Rate" value={vat?.effective_rate} highlight />
            <InfoRow
              label="Registration Threshold"
              value={`GH¢ ${Number(vat?.registration_threshold_goods ?? 0).toLocaleString()}`}
              note="Annual turnover"
            />
            <InfoRow label="Filing Frequency" value={vat?.filing_frequency} />
            <Deadline icon="calendar-outline" label="Filing Deadline" value={vat?.filing_deadline} />
          </Section>

          {/* ── PAYE ───────────────────────────────── */}
          <Section
            icon="people-outline"
            title="PAYE (Pay As You Earn)"
            description={`PAYE applies to employees. Employers deduct income tax from salaries each month before paying the employee, then remit it to the GRA.\n\nAs an employer, you must remit PAYE by the ${paye?.remittance_deadline ?? "15th of the following month"}.`}
          >
            <BracketTable brackets={paye?.brackets ?? []} label="Monthly Income (GH¢)" />
            <Deadline icon="calendar-outline" label="Monthly Remittance" value={paye?.remittance_deadline} />
            <Deadline icon="calendar-outline" label="Annual Return" value={paye?.annual_return_deadline} />
          </Section>

          {/* ── WITHHOLDING TAX ────────────────────── */}
          <Section
            icon="git-branch-outline"
            title="Withholding Tax (WHT)"
            description="Withholding tax is deducted at source by the payer before payment reaches the recipient. It acts as an advance payment of the recipient's income tax. The rate depends on the type of payment being made."
          >
            <View style={styles.whtTable}>
              <View style={styles.whtHeader}>
                <Text style={[styles.whtCell, styles.whtHeaderText, { flex: 3 }]}>Payment Type</Text>
                <Text style={[styles.whtCell, styles.whtHeaderText, { flex: 1, textAlign: "right" }]}>Rate</Text>
              </View>
              {(withholding?.rates ?? []).map((r: any, i: number) => (
                <View key={i} style={[styles.whtRow, i % 2 === 1 && styles.whtRowAlt]}>
                  <View style={{ flex: 3 }}>
                    <Text style={styles.whtCategory}>{r.category}</Text>
                    {r.description ? (
                      <Text style={styles.whtDescription}>{r.description}</Text>
                    ) : null}
                  </View>
                  <Text style={[styles.whtCell, styles.whtRate, { flex: 1 }]}>{r.rate}</Text>
                </View>
              ))}
            </View>
          </Section>

          {/* ── PENALTIES ──────────────────────────── */}
          {penalties && (
            <Section
              icon="warning-outline"
              title="Late Payment Penalties"
              description="The GRA imposes penalties for late filing or payment of taxes. It is important to meet all deadlines to avoid these additional costs."
            >
              <InfoRow label="Late Payment Penalty" value={penalties.late_payment_rate} highlight />
              <InfoRow label="PAYE Late Remittance" value={penalties.paye_late_remittance} />
            </Section>
          )}

          {/* ── DISCLAIMER ─────────────────────────── */}
          <View style={styles.disclaimer}>
            <Ionicons name="information-circle-outline" size={16} color="#9CA3AF" />
            <Text style={styles.disclaimerText}>
              Rates are provided by the Ghana Revenue Authority (GRA) and are for
              the {taxYear} tax year. Always consult a tax professional for advice
              specific to your situation.
            </Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}

/* ── Helper components ─────────────────────────────────────────── */

function Section({
  icon,
  title,
  description,
  children,
}: {
  icon: any;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIconWrap}>
          <Ionicons name={icon} size={18} color="#C44736" />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <Text style={styles.sectionDesc}>{description}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

function BracketTable({ brackets, label }: { brackets: any[]; label: string }) {
  if (brackets.length === 0) return null;
  return (
    <View style={styles.bracketTable}>
      <View style={styles.bracketHeader}>
        <Text style={[styles.bracketCell, styles.bracketHeaderText, { flex: 3 }]}>{label}</Text>
        <Text style={[styles.bracketCell, styles.bracketHeaderText, { flex: 1, textAlign: "right" }]}>Rate</Text>
      </View>
      {brackets.map((b: any, i: number) => (
        <View key={i} style={[styles.bracketRow, i % 2 === 1 && styles.bracketRowAlt]}>
          <Text style={[styles.bracketCell, { flex: 3 }]}>
            {b.to
              ? `${Number(b.from).toLocaleString()} – ${Number(b.to).toLocaleString()}`
              : `Above ${Number(b.from).toLocaleString()}`}
          </Text>
          <Text style={[styles.bracketCell, styles.rateText, { flex: 1 }]}>{b.rate}</Text>
        </View>
      ))}
    </View>
  );
}

function InfoRow({
  label,
  value,
  note,
  highlight,
}: {
  label: string;
  value?: string;
  note?: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={{ flex: 1, marginRight: 8 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        {note ? <Text style={styles.infoNote}>{note}</Text> : null}
      </View>
      <Text style={[styles.infoValue, highlight && styles.infoHighlight]}>
        {value ?? "—"}
      </Text>
    </View>
  );
}

function Deadline({ icon, label, value }: { icon: any; label: string; value?: string }) {
  return (
    <View style={styles.deadlineRow}>
      <Ionicons name={icon} size={14} color="#9CA3AF" style={{ marginRight: 6 }} />
      <Text style={styles.deadlineLabel}>{label}: </Text>
      <Text style={styles.deadlineValue}>{value ?? "—"}</Text>
    </View>
  );
}

function fmt(n: number) {
  return Number(n).toLocaleString();
}

/* ── Styles ────────────────────────────────────────────────────── */

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
    fontFamily: "Inter_700Bold",
    color: "#111827",
    marginLeft: 10,
  },
  subtitle: {
    fontSize: 13,
    color: "#9CA3AF",
    fontFamily: "Inter_400Regular",
    marginBottom: 18,
  },

  // Section
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#FCE8E6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#111827",
  },
  sectionDesc: {
    fontSize: 13,
    color: "#6B7280",
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    marginBottom: 16,
  },
  sectionContent: {
    borderTopWidth: 1,
    borderTopColor: "#EDE8E3",
    paddingTop: 14,
  },

  // Bracket table
  bracketTable: {
    marginBottom: 14,
  },
  bracketHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 8,
    marginBottom: 4,
  },
  bracketHeaderText: {
    color: "#9CA3AF",
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  bracketRow: {
    flexDirection: "row",
    paddingVertical: 9,
    paddingHorizontal: 4,
    borderRadius: 6,
  },
  bracketRowAlt: {
    backgroundColor: "#F2EDE8",
  },
  bracketCell: {
    color: "#111827",
    fontFamily: "Inter_400Regular",
    fontSize: 13,
  },
  rateText: {
    fontFamily: "Inter_700Bold",
    color: "#C44736",
    textAlign: "right",
  },

  // Info rows
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#EDE8E3",
  },
  infoLabel: {
    fontSize: 13,
    color: "#374151",
    fontFamily: "Inter_500Medium",
  },
  infoNote: {
    fontSize: 11,
    color: "#9CA3AF",
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  infoValue: {
    fontSize: 13,
    color: "#111827",
    fontFamily: "Inter_600SemiBold",
  },
  infoHighlight: {
    color: "#C44736",
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },

  // Deadline row
  deadlineRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  deadlineLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    fontFamily: "Inter_400Regular",
  },
  deadlineValue: {
    fontSize: 12,
    color: "#374151",
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },

  // WHT table
  whtTable: {
    marginBottom: 4,
  },
  whtHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 8,
    marginBottom: 4,
  },
  whtHeaderText: {
    color: "#9CA3AF",
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  whtRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 6,
  },
  whtRowAlt: {
    backgroundColor: "#F2EDE8",
  },
  whtCell: {
    color: "#111827",
    fontFamily: "Inter_400Regular",
    fontSize: 13,
  },
  whtCategory: {
    fontSize: 13,
    color: "#111827",
    fontFamily: "Inter_500Medium",
  },
  whtDescription: {
    fontSize: 11,
    color: "#9CA3AF",
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  whtRate: {
    fontFamily: "Inter_700Bold",
    color: "#C44736",
    textAlign: "right",
  },

  // Error + disclaimer
  errorBox: {
    alignItems: "center",
    marginTop: 60,
  },
  errorText: {
    marginTop: 12,
    color: "#9CA3AF",
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  disclaimer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    gap: 8,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: "#9CA3AF",
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
});

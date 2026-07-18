import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { previewTaxReturn, submitTaxReturn } from "@/services/taxReturns.service";
import { useTaxReturns } from "../context/TaxReturnsContext";
import { getUserFriendlyError } from "@/utils/error";
import { useToast } from "@/context/ToastContext";
import { useNetwork } from "@/context/NetworkContext";

const TAX_TYPE_LABELS: Record<string, string> = {
  income_tax: "Income Tax",
  vat: "VAT",
  paye: "PAYE",
  withholding: "Withholding Tax",
  corporate_tax: "Corporate Tax",
};

const fmt = (n: number | string | null | undefined) =>
  `GH¢ ${Number(n ?? 0).toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function fmtShort(d: string) {
  return new Date(d).toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" });
}

function SectionLabel({ title }: { title: string }) {
  return <Text style={styles.sectionLabel}>{title}</Text>;
}

function DetailRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, highlight && { color: "#C44736", fontFamily: "Inter_700Bold" }]}>
        {value}
      </Text>
    </View>
  );
}

export default function TaxReturnReviewScreen() {
  const { returnId } = useLocalSearchParams<{ returnId: string }>();
  const { refreshReturns } = useTaxReturns();
  const { showToast } = useToast();
  const { isOnline } = useNetwork();

  const [preview, setPreview] = useState<any>(null);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!returnId) return;
    (async () => {
      try {
        const res = await previewTaxReturn(returnId as string);
        setPreview(res.data ?? res);
      } catch (error: any) {
        showToast(getUserFriendlyError(error), "error");
      } finally {
        setLoadingPreview(false);
      }
    })();
  }, [returnId]);

  const handleSubmit = async () => {
    if (!isOnline) {
      showToast("You're offline. Connect to the internet to submit.", "info");
      return;
    }
    if (submitting || !preview?.readyToSubmit) return;
    setSubmitting(true);
    try {
      const res = await submitTaxReturn(returnId as string);
      await refreshReturns();
      const submitData = res.data ?? res;
      router.replace({
        pathname: "/tax-return-confirmation",
        params: {
          returnId: submitData.returnId ?? returnId,
          graReference: submitData.graReference ?? "",
          taxType: submitData.taxType ?? preview?.returnDetails?.taxType ?? "",
          submittedAt: submitData.submittedAt ?? new Date().toISOString(),
          nextStep: submitData.nextStep ?? "",
        },
      });
    } catch (error: any) {
      showToast(getUserFriendlyError(error), "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingPreview) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#C44736" />
          <Text style={styles.loadingText}>Loading preview…</Text>
        </View>
      </SafeAreaView>
    );
  }

  const taxpayer = preview?.taxpayer;
  const details = preview?.returnDetails;
  const financials = preview?.financials;
  const warnings: any[] = preview?.warnings ?? [];
  const readyToSubmit: boolean = preview?.readyToSubmit ?? false;
  const breakdown: any[] = financials?.bracketBreakdown ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Review Return</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Warnings ── */}
        {warnings.length > 0 && (
          <View style={styles.warningsCard}>
            <View style={styles.warningsHeader}>
              <Ionicons name="warning-outline" size={16} color="#D97706" />
              <Text style={styles.warningsTitle}>Warnings ({warnings.length})</Text>
            </View>
            {warnings.map((w, i) => (
              <Text key={i} style={styles.warningItem}>• {w.message}</Text>
            ))}
          </View>
        )}

        {/* ── Not ready banner ── */}
        {!readyToSubmit && !loadingPreview && (
          <View style={styles.notReadyBanner}>
            <Ionicons name="information-circle-outline" size={16} color="#DC2626" />
            <Text style={styles.notReadyText}>
              This return has unresolved issues and cannot be submitted yet.
            </Text>
          </View>
        )}

        {/* ── Taxpayer info ── */}
        {taxpayer && (
          <>
            <SectionLabel title="Taxpayer" />
            <View style={styles.card}>
              <DetailRow label="Name" value={taxpayer.fullName ?? "—"} />
              {taxpayer.tin && (
                <>
                  <View style={styles.rowDivider} />
                  <DetailRow label="TIN" value={taxpayer.tin} />
                </>
              )}
              {taxpayer.taxpayerCategory && (
                <>
                  <View style={styles.rowDivider} />
                  <DetailRow label="Category" value={taxpayer.taxpayerCategory} />
                </>
              )}
              {taxpayer.region && (
                <>
                  <View style={styles.rowDivider} />
                  <DetailRow label="Region" value={taxpayer.region} />
                </>
              )}
            </View>
          </>
        )}

        {/* ── Return details ── */}
        {details && (
          <>
            <SectionLabel title="Return Details" />
            <View style={styles.card}>
              <DetailRow label="Tax Type" value={TAX_TYPE_LABELS[details.taxType] ?? details.taxType} />
              <View style={styles.rowDivider} />
              <DetailRow label="Tax Year" value={String(details.taxYear)} />
              <View style={styles.rowDivider} />
              <DetailRow
                label="Period"
                value={`${fmtShort(details.periodStart)} – ${fmtShort(details.periodEnd)}`}
              />
            </View>
          </>
        )}

        {/* ── Financials ── */}
        {financials && (
          <>
            <SectionLabel title="Financials" />
            <View style={styles.card}>
              <DetailRow label="Gross Income" value={fmt(financials.grossIncome)} />
              <View style={styles.rowDivider} />
              <DetailRow label="Total Deductions" value={fmt(financials.totalDeductions)} />
              <View style={styles.rowDivider} />
              <DetailRow label="Taxable Income" value={fmt(financials.taxableIncome)} />
              <View style={styles.rowDivider} />
              <DetailRow label="Tax Liability" value={fmt(financials.taxLiability)} highlight />
            </View>
          </>
        )}

        {/* ── Bracket breakdown ── */}
        {breakdown.length > 0 && (
          <>
            <SectionLabel title="Tax Bracket Breakdown" />
            <View style={styles.card}>
              {breakdown.map((b: any, i: number) => (
                <React.Fragment key={i}>
                  {i > 0 && <View style={styles.rowDivider} />}
                  <View style={styles.bracketRow}>
                    <View style={styles.bracketLeft}>
                      <Text style={styles.bracketRate}>{b.rate}%</Text>
                      <Text style={styles.bracketAmount}>on {fmt(b.taxableAmount)}</Text>
                    </View>
                    <Text style={styles.bracketTax}>{fmt(b.taxAmount)}</Text>
                  </View>
                </React.Fragment>
              ))}
            </View>
          </>
        )}

        {/* ── Submit button ── */}
        <TouchableOpacity
          style={[
            styles.submitBtn,
            (!readyToSubmit || submitting) && styles.submitBtnDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!readyToSubmit || submitting}
          activeOpacity={0.85}
        >
          <Text style={styles.submitBtnText}>
            {submitting ? "Submitting…" : readyToSubmit ? "Submit Tax Return" : "Cannot Submit Yet"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F2EDE8" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },

  title: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#111827" },

  scroll: { paddingHorizontal: 20, paddingBottom: 48 },

  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  loadingText: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#9CA3AF" },

  // ── Warnings ──
  warningsCard: {
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },

  warningsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },

  warningsTitle: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#D97706",
  },

  warningItem: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#92400E",
    lineHeight: 20,
  },

  notReadyBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },

  notReadyText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#DC2626",
    lineHeight: 18,
  },

  // ── Section label ──
  sectionLabel: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    color: "#C44736",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 8,
    marginTop: 4,
  },

  // ── Card ──
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  rowDivider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 12,
  },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  detailLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
  },

  detailValue: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#111827",
    textAlign: "right",
    flex: 1,
    marginLeft: 16,
  },

  // ── Bracket breakdown ──
  bracketRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  bracketLeft: {},

  bracketRate: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: "#111827",
  },

  bracketAmount: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
    marginTop: 1,
  },

  bracketTax: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#C44736",
  },

  // ── Submit button ──
  submitBtn: {
    backgroundColor: "#C44736",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#C44736",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  submitBtnDisabled: {
    backgroundColor: "#9CA3AF",
    shadowColor: "#9CA3AF",
    shadowOpacity: 0.1,
  },

  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
});

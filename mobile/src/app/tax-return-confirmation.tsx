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
import { SafeAreaView } from "react-native-safe-area-context";

const TAX_TYPE_LABELS: Record<string, string> = {
  income_tax: "Income Tax",
  vat: "VAT",
  paye: "PAYE",
  withholding: "Withholding Tax",
  corporate_tax: "Corporate Tax",
};

function fmtLong(d: string) {
  try {
    return new Date(d).toLocaleDateString("en-GH", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return d;
  }
}

export default function TaxReturnConfirmationScreen() {
  const { returnId, graReference, taxType, submittedAt, nextStep } =
    useLocalSearchParams<{
      returnId: string;
      graReference: string;
      taxType: string;
      submittedAt: string;
      nextStep: string;
    }>();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* ── Success icon ── */}
        <View style={styles.iconWrap}>
          <View style={styles.iconOuter}>
            <View style={styles.iconInner}>
              <Ionicons name="checkmark" size={44} color="#FFFFFF" />
            </View>
          </View>
        </View>

        <Text style={styles.title}>Return Submitted</Text>
        <Text style={styles.subtitle}>
          Your tax return has been recorded successfully. Keep this reference for your records.
        </Text>

        {/* ── Details card ── */}
        <View style={styles.card}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <View style={styles.submittedBadge}>
              <Text style={styles.submittedBadgeText}>Submitted</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tax Type</Text>
            <Text style={styles.detailValue}>
              {TAX_TYPE_LABELS[taxType] ?? taxType ?? "—"}
            </Text>
          </View>

          {graReference ? (
            <>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>GRA Reference</Text>
                <Text style={[styles.detailValue, { color: "#C44736" }]}>{graReference}</Text>
              </View>
            </>
          ) : null}

          {submittedAt ? (
            <>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Submitted On</Text>
                <Text style={styles.detailValue}>{fmtLong(submittedAt)}</Text>
              </View>
            </>
          ) : null}

          {nextStep ? (
            <>
              <View style={styles.divider} />
              <View style={styles.nextStepRow}>
                <Ionicons name="arrow-forward-circle-outline" size={16} color="#C44736" />
                <Text style={styles.nextStepText}>{nextStep}</Text>
              </View>
            </>
          ) : null}
        </View>

        {/* ── Info note ── */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
          <Text style={styles.infoText}>
            If a tax liability exists, proceed to Payments to settle the outstanding balance and receive your compliance certificate.
          </Text>
        </View>

        {/* ── Actions ── */}
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push("/payments")}
          activeOpacity={0.85}
        >
          <Ionicons name="card-outline" size={18} color="#FFFFFF" />
          <Text style={styles.primaryBtnText}>Pay Outstanding Tax</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.replace("/(tabs)/tax-returns" as never)}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryBtnText}>Back to Tax Returns</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F2EDE8" },

  scroll: { paddingHorizontal: 20, paddingBottom: 48, paddingTop: 32 },

  // ── Icon ──
  iconWrap: { alignItems: "center", marginBottom: 24 },

  iconOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(196,71,54,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },

  iconInner: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#C44736",
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    textAlign: "center",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 28,
    paddingHorizontal: 8,
  },

  // ── Card ──
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
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
  },

  submittedBadge: {
    backgroundColor: "#DCFCE7",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },

  submittedBadgeText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "#16A34A",
  },

  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 14,
  },

  nextStepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },

  nextStepText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#374151",
    lineHeight: 20,
  },

  // ── Info ──
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 24,
  },

  infoText: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    lineHeight: 18,
  },

  // ── Buttons ──
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#C44736",
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 12,
    shadowColor: "#C44736",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },

  secondaryBtn: {
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },

  secondaryBtnText: {
    color: "#374151",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
});

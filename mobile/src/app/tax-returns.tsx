import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BottomSheet from "@/components/BottomSheet";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTaxReturns } from "../context/TaxReturnsContext";
import { generateTaxReturn } from "@/services/taxReturns.service";
import { getUserFriendlyError } from "@/utils/error";
import { useToast } from "@/context/ToastContext";

const TAX_TYPE_LABELS: Record<string, string> = {
  income_tax: "Income Tax",
  vat: "VAT",
  paye: "PAYE",
  withholding: "Withholding Tax",
  corporate_tax: "Corporate Tax",
};

const TAX_TYPES = Object.entries(TAX_TYPE_LABELS).map(([value, label]) => ({ value, label }));

const fmt = (n: number) =>
  `GH¢ ${n.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function fmtShort(d: string) {
  return new Date(d).toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" });
}

export default function TaxReturnsScreen() {
  const { showToast } = useToast();
  const { returns, loading, refreshReturns } = useTaxReturns();

  const [showGenModal, setShowGenModal] = useState(false);
  const [selectedType, setSelectedType] = useState("income_tax");
  const [generating, setGenerating] = useState(false);

  const currentYear = new Date().getFullYear();
  const submitted = returns.filter((r) => r.status === "submitted");
  const drafts = returns.filter((r) => r.status === "draft");

  const handleGenerate = async () => {
    if (generating) return;
    setGenerating(true);
    try {
      const res = await generateTaxReturn(selectedType, currentYear);
      const returnId = res.data?.returnId ?? res.returnId;
      setShowGenModal(false);
      await refreshReturns();
      router.push({ pathname: "/tax-return-review", params: { returnId } });
    } catch (error: any) {
      showToast(getUserFriendlyError(error), "error");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Tax Returns</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* ── Stats row ── */}
        <View style={styles.statsRow}>
          <View style={styles.statPill}>
            <Text style={styles.statNum}>{submitted.length}</Text>
            <Text style={styles.statLabel}>Submitted</Text>
          </View>
          <View style={[styles.statPill, drafts.length > 0 && { backgroundColor: "#FEF3C7" }]}>
            <Text style={[styles.statNum, drafts.length > 0 && { color: "#D97706" }]}>{drafts.length}</Text>
            <Text style={[styles.statLabel, drafts.length > 0 && { color: "#D97706" }]}>Drafts</Text>
          </View>
        </View>

        {/* ── Generate button ── */}
        <TouchableOpacity style={styles.generateCard} onPress={() => setShowGenModal(true)} activeOpacity={0.85}>
          <View style={styles.generateIconBox}>
            <Ionicons name="add" size={22} color="#C44736" />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.generateTitle}>Generate New Return</Text>
            <Text style={styles.generateSub}>Pull your data and prepare a tax return for review</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </TouchableOpacity>

        {/* ── List ── */}
        {loading ? (
          <ActivityIndicator size="large" color="#C44736" style={{ marginTop: 40 }} />
        ) : returns.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconBox}>
              <Ionicons name="document-text-outline" size={28} color="#C44736" />
            </View>
            <Text style={styles.emptyTitle}>No tax returns yet</Text>
            <Text style={styles.emptySub}>Generate your first return above to get started.</Text>
          </View>
        ) : (
          <>
            {drafts.length > 0 && <Text style={styles.sectionTitle}>Drafts</Text>}
            {drafts.map((item) => (
              <ReturnCard
                key={item.id}
                item={item}
                onPress={() => router.push({ pathname: "/tax-return-review", params: { returnId: item.id } })}
              />
            ))}

            {submitted.length > 0 && <Text style={styles.sectionTitle}>Submitted</Text>}
            {submitted.map((item) => (
              <ReturnCard key={item.id} item={item} />
            ))}
          </>
        )}
      </ScrollView>

      {/* ── Generate Modal ── */}
      <BottomSheet visible={showGenModal} onClose={() => setShowGenModal(false)}>
        <View style={styles.sheetContent}>
          <Text style={styles.modalTitle}>Generate Tax Return</Text>
          <Text style={styles.modalSub}>Select the tax type for {currentYear}</Text>

          <View style={styles.typeList}>
            {TAX_TYPES.map((t) => (
              <TouchableOpacity
                key={t.value}
                style={[styles.typeRow, selectedType === t.value && styles.typeRowActive]}
                onPress={() => setSelectedType(t.value)}
                activeOpacity={0.8}
              >
                <Text style={[styles.typeLabel, selectedType === t.value && styles.typeLabelActive]}>
                  {t.label}
                </Text>
                {selectedType === t.value && <Ionicons name="checkmark" size={18} color="#C44736" />}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.genBtn, generating && { opacity: 0.6 }]}
            onPress={handleGenerate}
            disabled={generating}
            activeOpacity={0.85}
          >
            <Text style={styles.genBtnText}>{generating ? "Generating…" : "Generate Return"}</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

function ReturnCard({ item, onPress }: { item: any; onPress?: () => void }) {
  const isDraft = item.status === "draft";
  const Wrapper: any = onPress ? TouchableOpacity : View;

  return (
    <Wrapper style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.cardTop}>
        <View style={styles.cardIconBox}>
          <Ionicons name="document-text-outline" size={18} color="#C44736" />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.cardTaxType}>{TAX_TYPE_LABELS[item.taxType] ?? item.taxType}</Text>
          <Text style={styles.cardYear}>Tax Year {item.taxYear}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: isDraft ? "#FEF3C7" : "#DCFCE7" }]}>
          <Text style={[styles.badgeText, { color: isDraft ? "#D97706" : "#16A34A" }]}>
            {isDraft ? "Draft" : "Submitted"}
          </Text>
        </View>
      </View>

      <View style={styles.cardMeta}>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={12} color="#9CA3AF" />
          <Text style={styles.metaText}>
            {fmtShort(item.periodStart)} – {fmtShort(item.periodEnd)}
          </Text>
        </View>
        <Text style={styles.cardLiability}>
          {`GH¢ ${item.taxLiability.toLocaleString("en-GH", { minimumFractionDigits: 2 })}`}
        </Text>
      </View>

      {item.graReference && (
        <Text style={styles.graRef}>GRA Ref: {item.graReference}</Text>
      )}

      {item.submittedAt && (
        <Text style={styles.submittedAt}>Submitted {fmtShort(item.submittedAt)}</Text>
      )}

      {isDraft && onPress && (
        <View style={styles.continueRow}>
          <Text style={styles.continueText}>Tap to review and submit</Text>
          <Ionicons name="arrow-forward" size={13} color="#C44736" />
        </View>
      )}
    </Wrapper>
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

  // ── Stats ──
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },

  statPill: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  statNum: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#111827",
  },

  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: "#9CA3AF",
    marginTop: 2,
  },

  // ── Generate card ──
  generateCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: "#FDECEC",
    shadowColor: "#C44736",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  generateIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#FDECEC",
    justifyContent: "center",
    alignItems: "center",
  },

  generateTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#111827",
    marginBottom: 3,
  },

  generateSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
  },

  // ── Section title ──
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    color: "#C44736",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 10,
    marginTop: 4,
  },

  // ── Empty ──
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
  },

  emptyIconBox: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: "#FDECEC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },

  emptyTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    marginBottom: 6,
  },

  emptySub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
    textAlign: "center",
  },

  // ── Return card ──
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  cardIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#FDECEC",
    justifyContent: "center",
    alignItems: "center",
  },

  cardTaxType: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#111827",
  },

  cardYear: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
    marginTop: 1,
  },

  badge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },

  badgeText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },

  cardMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  metaText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
  },

  cardLiability: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#C44736",
  },

  graRef: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: "#9CA3AF",
    marginBottom: 2,
  },

  submittedAt: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
  },

  continueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },

  continueText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "#C44736",
  },

  sheetContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E5E7EB",
    alignSelf: "center",
    marginBottom: 20,
  },

  modalTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    marginBottom: 4,
  },

  modalSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
    marginBottom: 20,
  },

  typeList: {
    gap: 8,
    marginBottom: 24,
  },

  typeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: "transparent",
  },

  typeRowActive: {
    backgroundColor: "#FDECEC",
    borderColor: "#C44736",
  },

  typeLabel: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "#374151",
  },

  typeLabelActive: {
    fontFamily: "Inter_600SemiBold",
    color: "#C44736",
  },

  genBtn: {
    backgroundColor: "#C44736",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#C44736",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  genBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
});

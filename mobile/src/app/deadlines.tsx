import React, { useState } from "react";
import ErrorState from "@/components/ErrorState";
import { useDeadlines } from "../context/DeadlineContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomSheet from "@/components/BottomSheet";
import { getPenaltyById, disputePenalty } from "@/services/penalty.service";
import { getUserFriendlyError } from "@/utils/error";
import { useToast } from "@/context/ToastContext";

const TAX_TYPE_LABEL: Record<string, string> = {
  income_tax: "Income Tax",
  vat: "VAT",
  paye: "PAYE",
  withholding: "Withholding Tax",
  corporate_tax: "Corporate Tax",
};

const fmt = (n: number) =>
  `GH¢ ${n.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function DeadlinesScreen() {
  const { deadlines, penalties, loading, error, toggleDeadline, refreshDeadlines, upcomingCount, overdueCount } =
    useDeadlines();
  const { showToast } = useToast();
  const [refreshing, setRefreshing] = useState(false);

  const [selectedPenalty, setSelectedPenalty] = useState<any>(null);
  const [penaltyDetail, setPenaltyDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showDispute, setShowDispute] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputing, setDisputing] = useState(false);

  const openPenaltyDetail = async (penalty: any) => {
    setSelectedPenalty(penalty);
    setPenaltyDetail(null);
    const id = penalty.existing_penalty_id;
    if (!id) return;
    setDetailLoading(true);
    try {
      const res = await getPenaltyById(id);
      setPenaltyDetail(res.data ?? res);
    } catch {
      // use list data as fallback
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDispute = async () => {
    if (!selectedPenalty?.existing_penalty_id || !disputeReason.trim()) return;
    setDisputing(true);
    try {
      await disputePenalty(selectedPenalty.existing_penalty_id, disputeReason.trim());
      setShowDispute(false);
      setSelectedPenalty(null);
      setDisputeReason("");
      showToast("Dispute submitted successfully.", "success");
    } catch (error: any) {
      showToast(getUserFriendlyError(error), "error");
    } finally {
      setDisputing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshDeadlines(false);
    setRefreshing(false);
  };

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 3 + i);
    return {
      day: d.getDate().toString(),
      week: d.toLocaleDateString("en-US", { weekday: "short" }),
      active: d.toDateString() === new Date().toDateString(),
    };
  });

  const activePenalties = penalties.filter((p) => p.penalty_active);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)/dashboard"))}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Deadlines</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#C44736"]} tintColor="#C44736" />
        }
      >
        {/* ── Date strip ── */}
        <View style={styles.dateStrip}>
          {dates.map((item) => (
            <View
              key={item.day + item.week}
              style={[styles.dateCell, item.active && styles.dateCellActive]}
            >
              <Text style={[styles.dateDayNum, item.active && styles.dateTxtActive]}>
                {item.day}
              </Text>
              <Text style={[styles.dateWeekLabel, item.active && styles.dateTxtActive]}>
                {item.week}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Stats row ── */}
        <View style={styles.statsRow}>
          <View style={[styles.statPill, { backgroundColor: "#DCFCE7" }]}>
            <Text style={[styles.statNum, { color: "#16A34A" }]}>{upcomingCount}</Text>
            <Text style={[styles.statLabel, { color: "#16A34A" }]}>Upcoming</Text>
          </View>
          <View style={[styles.statPill, { backgroundColor: overdueCount > 0 ? "#FEE2E2" : "#F3F4F6" }]}>
            <Text style={[styles.statNum, { color: overdueCount > 0 ? "#DC2626" : "#9CA3AF" }]}>
              {overdueCount}
            </Text>
            <Text style={[styles.statLabel, { color: overdueCount > 0 ? "#DC2626" : "#9CA3AF" }]}>
              Overdue
            </Text>
          </View>
          {activePenalties.length > 0 && (
            <View style={[styles.statPill, { backgroundColor: "#FEF3C7" }]}>
              <Text style={[styles.statNum, { color: "#D97706" }]}>{activePenalties.length}</Text>
              <Text style={[styles.statLabel, { color: "#D97706" }]}>
                {activePenalties.length === 1 ? "Penalty" : "Penalties"}
              </Text>
            </View>
          )}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#C44736" style={{ marginTop: 40 }} />
        ) : error ? (
          <ErrorState onRetry={refreshDeadlines} />
        ) : deadlines.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconBox}>
              <Ionicons name="checkmark-circle-outline" size={30} color="#16A34A" />
            </View>
            <Text style={styles.emptyTitle}>All clear</Text>
            <Text style={styles.emptySub}>No upcoming tax deadlines right now.</Text>
          </View>
        ) : (
          <>
            {deadlines.map((item) => {
              const overdue = !item.completed && item.daysUntilDue < 0;
              const dueSoon = !item.completed && !overdue && item.daysUntilDue <= 7;

              let badgeBg = "#DCFCE7";
              let badgeColor = "#16A34A";
              let badgeLabel = "On time";

              if (item.completed) {
                badgeBg = "#F3F4F6";
                badgeColor = "#6B7280";
                badgeLabel = "Done";
              } else if (overdue) {
                badgeBg = "#FEE2E2";
                badgeColor = "#DC2626";
                badgeLabel = "Overdue";
              } else if (dueSoon) {
                badgeBg = "#FEF3C7";
                badgeColor = "#D97706";
                badgeLabel = "Due soon";
              }

              const daysLabel = overdue
                ? `${Math.abs(item.daysUntilDue)}d overdue`
                : item.daysUntilDue === 0
                ? "Due today"
                : `${item.daysUntilDue}d left`;

              return (
                <View key={item.id} style={styles.card}>
                  <View style={styles.cardTop}>
                    <View style={styles.cardIconBox}>
                      <Ionicons name="calendar-outline" size={18} color="#C44736" />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.cardTitle}>{item.title}</Text>
                      <Text style={styles.cardAuthority}>{item.authority}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: badgeBg }]}>
                      <Text style={[styles.badgeText, { color: badgeColor }]}>{badgeLabel}</Text>
                    </View>
                  </View>

                  <View style={styles.cardMeta}>
                    <View style={styles.metaItem}>
                      <Ionicons name="time-outline" size={13} color="#9CA3AF" />
                      <Text style={styles.metaText}>
                        {new Date(item.dueDate).toLocaleDateString("en-GH", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </Text>
                    </View>
                    {!item.completed && (
                      <Text
                        style={[
                          styles.daysLabel,
                          { color: overdue ? "#DC2626" : dueSoon ? "#D97706" : "#9CA3AF" },
                        ]}
                      >
                        {daysLabel}
                      </Text>
                    )}
                  </View>

                  {!item.completed && (
                    <TouchableOpacity
                      style={styles.markBtn}
                      onPress={() => toggleDeadline(item).catch(() => showToast("Could not mark deadline complete. Try again.", "error"))}
                      activeOpacity={0.85}
                    >
                      <Ionicons name="checkmark" size={14} color="#16A34A" />
                      <Text style={styles.markBtnText}>Mark Complete</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}

            {/* ── Penalties ── */}
            {activePenalties.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Outstanding Penalties</Text>
                {activePenalties.map((p, i) => (
                  <TouchableOpacity key={p.existing_penalty_id || i} style={styles.penaltyCard} onPress={() => openPenaltyDetail(p)} activeOpacity={0.85}>
                    <View style={styles.penaltyTop}>
                      <View style={styles.penaltyIconBox}>
                        <Ionicons name="warning-outline" size={16} color="#DC2626" />
                      </View>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.penaltyTaxType}>
                          {TAX_TYPE_LABEL[p.tax_type] ?? p.tax_type}
                        </Text>
                        <Text style={styles.penaltyMeta}>
                          {p.days_late}d late · due{" "}
                          {new Date(p.deadline_date).toLocaleDateString("en-GH", {
                            day: "numeric",
                            month: "short",
                          })}
                        </Text>
                      </View>
                      <Text style={styles.penaltyTotal}>{fmt(p.total_penalty)}</Text>
                    </View>

                    <View style={styles.penaltyBreakdown}>
                      <View style={styles.penaltyRow}>
                        <Text style={styles.penaltyRowLabel}>Base penalty</Text>
                        <Text style={styles.penaltyRowVal}>{fmt(p.base_penalty)}</Text>
                      </View>
                      <View style={styles.penaltyRow}>
                        <Text style={styles.penaltyRowLabel}>Daily penalty</Text>
                        <Text style={styles.penaltyRowVal}>{fmt(p.daily_penalty)}/day</Text>
                      </View>
                      {p.interest_amount > 0 && (
                        <View style={styles.penaltyRow}>
                          <Text style={styles.penaltyRowLabel}>Interest</Text>
                          <Text style={styles.penaltyRowVal}>{fmt(p.interest_amount)}</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.penaltyTapHint}>
                      <Text style={styles.penaltyTapText}>Tap for details & dispute options</Text>
                      <Ionicons name="chevron-forward" size={13} color="#9CA3AF" />
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </>
        )}

        <Text style={styles.footer}>Filing on time saves you from penalties and surcharges.</Text>
      </ScrollView>

      {/* Penalty detail sheet */}
      <BottomSheet visible={!!selectedPenalty && !showDispute} onClose={() => setSelectedPenalty(null)}>
        <View style={styles.sheetContent}>
          <View style={styles.sheetIconRow}>
            <View style={styles.sheetIconBox}>
              <Ionicons name="warning-outline" size={20} color="#DC2626" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.sheetTitle}>
                {TAX_TYPE_LABEL[selectedPenalty?.tax_type] ?? selectedPenalty?.tax_type}
              </Text>
              <Text style={styles.sheetSub}>
                {selectedPenalty?.days_late}d late · deadline{" "}
                {selectedPenalty?.deadline_date
                  ? new Date(selectedPenalty.deadline_date).toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" })
                  : "—"}
              </Text>
            </View>
          </View>

          {detailLoading ? (
            <ActivityIndicator color="#C44736" style={{ marginVertical: 20 }} />
          ) : (
            <View style={styles.detailCard}>
              {[
                { label: "Base Penalty", val: penaltyDetail?.base_penalty ?? selectedPenalty?.base_penalty },
                { label: "Daily Penalty", val: penaltyDetail?.daily_penalty ?? selectedPenalty?.daily_penalty, suffix: "/day" },
                { label: "Interest", val: penaltyDetail?.interest_amount ?? selectedPenalty?.interest_amount },
              ].map((row) =>
                (row.val ?? 0) > 0 ? (
                  <View key={row.label} style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{row.label}</Text>
                    <Text style={styles.detailVal}>
                      {`GH¢ ${Number(row.val).toLocaleString("en-GH", { minimumFractionDigits: 2 })}${row.suffix ?? ""}`}
                    </Text>
                  </View>
                ) : null
              )}
              <View style={styles.detailTotalRow}>
                <Text style={styles.detailTotalLabel}>Total Penalty</Text>
                <Text style={styles.detailTotalVal}>
                  {`GH¢ ${Number(penaltyDetail?.total_penalty ?? selectedPenalty?.total_penalty ?? 0).toLocaleString("en-GH", { minimumFractionDigits: 2 })}`}
                </Text>
              </View>
            </View>
          )}

          {(penaltyDetail?.guidance?.message ?? penaltyDetail?.message) && (
            <View style={styles.guidanceBox}>
              <Ionicons name="information-circle-outline" size={16} color="#D97706" style={{ marginTop: 1 }} />
              <Text style={styles.guidanceText}>{penaltyDetail.guidance?.message ?? penaltyDetail.message}</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.disputeBtn}
            onPress={() => setShowDispute(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="shield-checkmark-outline" size={16} color="#FFFFFF" />
            <Text style={styles.disputeBtnText}>Dispute This Penalty</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      {/* Dispute sheet */}
      <BottomSheet visible={showDispute} onClose={() => setShowDispute(false)} avoidKeyboard>
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Dispute Penalty</Text>
          <Text style={styles.sheetSub}>
            Explain why this penalty should be reviewed or waived by the GRA.
          </Text>

          <Text style={styles.disputeInputLabel}>YOUR REASON</Text>
          <TextInput
            style={styles.disputeInput}
            value={disputeReason}
            onChangeText={setDisputeReason}
            placeholder="e.g. Filing was delayed due to system errors on the GRA portal…"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.disputeBtn, (!disputeReason.trim() || disputing) && { opacity: 0.6 }]}
            onPress={handleDispute}
            disabled={!disputeReason.trim() || disputing}
            activeOpacity={0.85}
          >
            <Text style={styles.disputeBtnText}>{disputing ? "Submitting…" : "Submit Dispute"}</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
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

  // ── Date strip ──
  dateStrip: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  dateCell: {
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 40,
  },

  dateCellActive: {
    backgroundColor: "#C44736",
  },

  dateDayNum: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#111827",
  },

  dateWeekLabel: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    color: "#9CA3AF",
    marginTop: 2,
  },

  dateTxtActive: {
    color: "#FFFFFF",
  },

  // ── Stats row ──
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },

  statPill: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 14,
  },

  statNum: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },

  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    marginTop: 2,
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
    backgroundColor: "#DCFCE7",
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
    color: "#6B7280",
    textAlign: "center",
  },

  // ── Section title ──
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: "#C44736",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginTop: 8,
    marginBottom: 12,
  },

  // ── Deadline card ──
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

  cardTitle: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#111827",
    marginBottom: 2,
  },

  cardAuthority: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
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
    marginBottom: 10,
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

  daysLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },

  markBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#DCFCE7",
    borderRadius: 10,
    paddingVertical: 9,
  },

  markBtnText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#16A34A",
  },

  // ── Penalty card ──
  penaltyCard: {
    backgroundColor: "#FFF8F6",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },

  penaltyTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  penaltyIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
  },

  penaltyTaxType: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#111827",
    marginBottom: 2,
  },

  penaltyMeta: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
  },

  penaltyTotal: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#DC2626",
  },

  penaltyBreakdown: {
    borderTopWidth: 1,
    borderTopColor: "#FECACA",
    paddingTop: 10,
    gap: 6,
  },

  penaltyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  penaltyRowLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
  },

  penaltyRowVal: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "#374151",
  },

  // ── Footer ──
  footer: {
    textAlign: "center",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
    marginTop: 16,
  },

  // Penalty tap hint
  penaltyTapHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 3,
    marginTop: 8,
  },
  penaltyTapText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
  },

  // Penalty detail sheet
  sheetContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  sheetIconRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sheetIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
  },
  sheetTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    marginBottom: 2,
  },
  sheetSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
  },
  detailCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    gap: 10,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
  },
  detailVal: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#374151",
  },
  detailTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 10,
    marginTop: 2,
  },
  detailTotalLabel: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: "#111827",
  },
  detailTotalVal: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#DC2626",
  },
  guidanceBox: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#FFFBEB",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  guidanceText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#92400E",
    lineHeight: 20,
  },
  disputeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#C44736",
    borderRadius: 14,
    paddingVertical: 15,
    shadowColor: "#C44736",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  disputeBtnText: {
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },

  // Dispute form
  disputeInputLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "#6B7280",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 12,
  },
  disputeInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#111827",
    minHeight: 100,
    marginBottom: 20,
  },
});

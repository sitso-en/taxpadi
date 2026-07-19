import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useInvoices } from "@/context/InvoiceContext";
import ErrorState from "@/components/ErrorState";
import { usePrivacy } from "@/context/PrivacyContext";

const FILTERS = ["All", "Unpaid", "Paid", "Overdue", "Cancelled"];

const fmt = (n: number) =>
  `GH¢ ${n.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

type StatusKey = "paid" | "cancelled" | "overdue" | "unpaid";

const STATUS_CONFIG: Record<StatusKey, { label: string; color: string; bg: string }> = {
  paid:      { label: "Paid",      color: "#16A34A", bg: "#DCFCE7" },
  cancelled: { label: "Cancelled", color: "#6B7280", bg: "#F3F4F6" },
  overdue:   { label: "Overdue",   color: "#DC2626", bg: "#FEE2E2" },
  unpaid:    { label: "Unpaid",    color: "#C44736", bg: "#FDECEC" },
};

function getStatusKey(status: string, overdue: boolean): StatusKey {
  if (overdue) return "overdue";
  if (status === "paid") return "paid";
  if (status === "cancelled") return "cancelled";
  return "unpaid";
}

function formatDue(dueDate: string, daysUntilDue: number, status: string): string {
  if (status === "paid") return `Paid`;
  if (status === "cancelled") return "Cancelled";
  if (daysUntilDue < 0) return `${Math.abs(daysUntilDue)}d overdue`;
  if (daysUntilDue === 0) return "Due today";
  if (daysUntilDue <= 3) return `Due in ${daysUntilDue}d`;
  return `Due ${dueDate}`;
}

export default function InvoicesScreen() {
  const { invoices, stats, loading, error, refreshInvoices, markPaid, cancel } = useInvoices();
  const { amountsHidden } = usePrivacy();
  const [selectedFilter, setSelectedFilter] = React.useState("All");
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshInvoices(false);
    setRefreshing(false);
  };

  const filteredInvoices = useMemo(() => {
    if (selectedFilter === "All") return invoices;
    if (selectedFilter === "Overdue")
      return invoices.filter((inv) => inv.status === "unpaid" && inv.daysUntilDue < 0);
    return invoices.filter((inv) => inv.status === selectedFilter.toLowerCase());
  }, [invoices, selectedFilter]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Invoices</Text>
            <Text style={styles.subtitle}>Track what you're owed</Text>
          </View>
          <TouchableOpacity
            style={styles.newBtn}
            onPress={() => router.push("/create-invoice")}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.newBtnText}>New</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#C44736"]} tintColor="#C44736" />
          }
        >
          {loading ? (
            <ActivityIndicator size="large" color="#C44736" style={{ marginTop: 48 }} />
          ) : error ? (
            <ErrorState onRetry={refreshInvoices} />
          ) : (
            <>
              {/* ── Stats card ── */}
              <View style={styles.statsCard}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Total Invoiced</Text>
                  <Text style={styles.statAmount}>
                    {amountsHidden ? "••••••" : fmt(stats?.total_invoiced ?? 0)}
                  </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Collected</Text>
                  <Text style={[styles.statAmount, { color: "#16A34A" }]}>
                    {amountsHidden ? "••••••" : fmt(stats?.total_paid ?? 0)}
                  </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Outstanding</Text>
                  <Text style={[styles.statAmount, { color: "#C44736" }]}>
                    {amountsHidden ? "••••••" : fmt(stats?.total_outstanding ?? 0)}
                  </Text>
                </View>
              </View>

              {/* ── Filters ── */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterScroll}
                contentContainerStyle={{ paddingRight: 4 }}
              >
                {FILTERS.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[styles.filterChip, selectedFilter === item && styles.filterChipActive]}
                    onPress={() => setSelectedFilter(item)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.filterChipText, selectedFilter === item && styles.filterChipTextActive]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* ── List ── */}
              {filteredInvoices.length === 0 ? (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIconCircle}>
                    <Ionicons name="document-text-outline" size={36} color="#C44736" />
                  </View>
                  <Text style={styles.emptyTitle}>
                    {selectedFilter === "All" ? "No invoices yet" : `No ${selectedFilter.toLowerCase()} invoices`}
                  </Text>
                  <Text style={styles.emptyText}>
                    {selectedFilter === "All"
                      ? "Create your first invoice and start tracking what you're owed."
                      : "Try a different filter to see more invoices."}
                  </Text>
                  {selectedFilter === "All" && (
                    <TouchableOpacity
                      style={styles.emptyButton}
                      onPress={() => router.push("/create-invoice")}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.emptyButtonText}>Create Invoice</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                filteredInvoices.map((invoice) => {
                  const overdue = invoice.status === "unpaid" && invoice.daysUntilDue < 0;
                  const key = getStatusKey(invoice.status, overdue);
                  const cfg = STATUS_CONFIG[key];

                  return (
                    <View key={invoice.id} style={styles.card}>
                      {/* Top row: ref + badge */}
                      <View style={styles.cardTopRow}>
                        <Text style={styles.invoiceRef}>{invoice.invoiceRef}</Text>
                        <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
                          <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
                        </View>
                      </View>

                      {/* Client + amount */}
                      <View style={styles.cardMainRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.clientName} numberOfLines={1}>{invoice.customerName}</Text>
                          <Text style={[styles.dueLabel, overdue && { color: "#DC2626" }]}>
                            {formatDue(invoice.dueDate, invoice.daysUntilDue, invoice.status)}
                          </Text>
                        </View>
                        <Text style={[styles.amount, { color: cfg.color }]}>
                          {amountsHidden ? "••••••" : fmt(invoice.amount)}
                        </Text>
                      </View>

                      {/* Actions — only for unpaid */}
                      {invoice.status === "unpaid" && (
                        <View style={styles.cardActions}>
                          <TouchableOpacity
                            style={styles.actionBtnPrimary}
                            onPress={() => markPaid(invoice.id)}
                            activeOpacity={0.85}
                          >
                            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                            <Text style={styles.actionBtnPrimaryText}>Mark Paid</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.actionBtnGhost}
                            onPress={() => cancel(invoice.id)}
                            activeOpacity={0.75}
                          >
                            <Text style={styles.actionBtnGhostText}>Cancel</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  );
                })
              )}
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F2EDE8",
  },

  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  // ── Header ──
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },

  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
    marginTop: 2,
  },

  newBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#C44736",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 4,
    shadowColor: "#C44736",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  newBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },

  // ── Stats ──
  statsCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  statItem: {
    flex: 1,
    alignItems: "center",
  },

  statDivider: {
    width: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 4,
  },

  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: "#9CA3AF",
    marginBottom: 6,
    textAlign: "center",
  },

  statAmount: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    textAlign: "center",
  },

  // ── Filters ──
  filterScroll: {
    marginBottom: 20,
    flexGrow: 0,
  },

  filterChip: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: "transparent",
  },

  filterChipActive: {
    backgroundColor: "#FDECEC",
    borderColor: "#C44736",
  },

  filterChipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#6B7280",
  },

  filterChipTextActive: {
    color: "#C44736",
  },

  // ── Empty state ──
  emptyState: {
    alignItems: "center",
    paddingTop: 48,
    paddingHorizontal: 24,
  },

  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: "#FDECEC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },

  emptyButton: {
    backgroundColor: "#C44736",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 28,
    shadowColor: "#C44736",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  emptyButtonText: {
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },

  // ── Invoice card ──
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  invoiceRef: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "#9CA3AF",
    letterSpacing: 0.3,
  },

  badge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },

  badgeText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },

  cardMainRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },

  clientName: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    marginBottom: 4,
  },

  dueLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
  },

  amount: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    marginLeft: 12,
  },

  // ── Card actions ──
  cardActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },

  actionBtnPrimary: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16A34A",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 5,
  },

  actionBtnPrimaryText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },

  actionBtnGhost: {
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },

  actionBtnGhostText: {
    color: "#6B7280",
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
});
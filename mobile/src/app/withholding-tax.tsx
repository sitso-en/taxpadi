import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getWithholdingTransactions, remitWithholdingTransaction } from "@/services/withholding.service";
import { usePrivacy } from "@/context/PrivacyContext";
import { useToast } from "@/context/ToastContext";
import { getUserFriendlyError } from "@/utils/error";
import SubscriptionGate from "@/components/SubscriptionGate";
import { useSubscription } from "@/context/SubscriptionContext";

const fmt = (n: number) =>
  `GH¢ ${n.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function WithholdingTaxScreen() {
  const { isPro } = useSubscription();
  const { amountsHidden, toggleAmountsHidden } = usePrivacy();
  const { showToast } = useToast();
  const [summary, setSummary] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [remittingId, setRemittingId] = useState<string | null>(null);
  const [confirmRemitId, setConfirmRemitId] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await getWithholdingTransactions();
      setSummary(res.data?.summary ?? null);
      setTransactions(res.data?.transactions ?? []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (!isPro) return (
    <SubscriptionGate
      feature="Withholding Tax"
      description="Track withholding deductions made by clients and remit them to the GRA directly from the app."
      icon="document-text-outline"
    />
  );

  const handleRemit = async () => {
    if (!confirmRemitId || remittingId) return;
    const id = confirmRemitId;
    setRemittingId(id);
    setConfirmRemitId(null);
    try {
      await remitWithholdingTransaction(id);
      showToast("Marked as remitted to GRA.", "success");
      await load();
    } catch (error: any) {
      showToast(getUserFriendlyError(error), "error");
    } finally {
      setRemittingId(null);
    }
  };

  const Row = ({ label, value }: { label: string; value: string }) => (
    <>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
      <View style={styles.divider} />
    </>
  );

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
        <Text style={styles.title}>Withholding Tax</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#C44736" style={{ marginTop: 40 }} />
      ) : (
        <>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>OUTSTANDING WITHHOLDING</Text>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}>
              <Text style={styles.summaryAmount}>
                {amountsHidden ? "••••••" : fmt(summary?.total_outstanding ?? 0)}
              </Text>
              <TouchableOpacity onPress={toggleAmountsHidden} style={{ marginLeft: 12 }}>
                <Ionicons
                  name={amountsHidden ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Row label="Withholding Deducted" value={amountsHidden ? "••••••" : fmt(summary?.total_withheld ?? 0)} />
            <Row label="Remitted Amount" value={amountsHidden ? "••••••" : fmt(summary?.total_remitted ?? 0)} />
            <Row label="Outstanding Amount" value={amountsHidden ? "••••••" : fmt(summary?.total_outstanding ?? 0)} />
          </View>

          <Text style={styles.section}>History</Text>

          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="swap-horizontal-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No withholding transactions yet</Text>
              <Text style={styles.emptySubtitle}>
                Withholding records appear when transactions with a withholding deduction are recorded.
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push("/(tabs)/add-transaction")}
              >
                <Text style={styles.emptyButtonText}>Add a Transaction</Text>
              </TouchableOpacity>
            </View>
          ) : (
            transactions.map((item) => (
              <View key={item.transaction_id} style={styles.historyCard}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={styles.historyTitle} numberOfLines={1}>
                    {item.description}
                  </Text>
                  <Text style={[styles.historyStatus, { color: item.remitted ? "#16A34A" : "#D97706" }]}>
                    {item.remitted ? "Remitted" : "Pending"} · {item.withholding_rate}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end", gap: 8 }}>
                  <Text style={styles.historyAmount}>
                    {amountsHidden ? "••••••" : fmt(item.withholding_amount)}
                  </Text>
                  {!item.remitted && (
                    <TouchableOpacity
                      style={[styles.remitBtn, remittingId === item.transaction_id && { opacity: 0.5 }]}
                      onPress={() => setConfirmRemitId(item.transaction_id)}
                      disabled={!!remittingId}
                    >
                      <Text style={styles.remitBtnText}>
                        {remittingId === item.transaction_id ? "Remitting…" : "Mark Remitted"}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )}

        </>
      )}

      {/* Confirm remit modal */}
      <Modal
        visible={!!confirmRemitId}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmRemitId(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconBox}>
              <Ionicons name="checkmark-circle-outline" size={24} color="#16A34A" />
            </View>
            <Text style={styles.modalTitle}>Mark as Remitted?</Text>
            <Text style={styles.modalText}>
              Confirm that this withholding amount has been paid to GRA. This cannot be undone.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setConfirmRemitId(null)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={handleRemit}>
                <Text style={styles.confirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    color: "#111827",
    marginLeft: 10,
    fontFamily: "Inter_700Bold",
  },

  summaryCard: {
    backgroundColor: "#C44736",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },

  summaryLabel: {
    color: "#FDECEC",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },

  summaryAmount: {
    color: "#FFFFFF",
    fontSize: 34,
    fontFamily: "Inter_700Bold",
  },

  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
  },

  divider: {
    height: 1,
    backgroundColor: "#EDE8E3",
  },

  label: {
    color: "#6B7280",
    fontFamily: "Inter_500Medium",
  },

  value: {
    color: "#111827",
    fontFamily: "Inter_600SemiBold",
  },

  section: {
    fontSize: 16,
    color: "#111827",
    marginBottom: 14,
    fontFamily: "Inter_700Bold",
  },

  historyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  historyTitle: {
    color: "#111827",
    fontFamily: "Inter_600SemiBold",
  },

  historyStatus: {
    marginTop: 4,
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },

  historyAmount: {
    color: "#111827",
    fontFamily: "Inter_700Bold",
  },

  button: {
    backgroundColor: "#C44736",
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 20,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  emptyState: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    marginBottom: 12,
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
    marginBottom: 18,
  },
  emptyButton: {
    backgroundColor: "#C44736",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  emptyButtonText: {
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },

  remitBtn: {
    backgroundColor: "#ECFDF5",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "#16A34A",
  },
  remitBtnText: {
    color: "#16A34A",
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
  },

  // Confirm modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    alignItems: "center",
  },
  modalIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#ECFDF5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    marginBottom: 6,
  },
  modalText: {
    color: "#6B7280",
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#EDE8E3",
    alignItems: "center",
  },
  cancelText: {
    fontFamily: "Inter_600SemiBold",
    color: "#111827",
    fontSize: 14,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#16A34A",
    alignItems: "center",
  },
  confirmText: {
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
});
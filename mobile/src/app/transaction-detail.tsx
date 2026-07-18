import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { getTransaction, deleteTransaction } from "@/services/transaction.service";
import { getUserFriendlyError } from "@/utils/error";
import { useToast } from "@/context/ToastContext";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { showToast } = useToast();

  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await getTransaction(id);
        setTransaction(res.data ?? res);
      } catch (error: any) {
        showToast(getUserFriendlyError(error), "error");
        router.back();
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await deleteTransaction(id);
      setShowDeleteModal(false);
      showToast("Transaction deleted.", "success");
      router.replace("/(tabs)/transactions");
    } catch (error: any) {
      showToast(getUserFriendlyError(error), "error");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#C44736" />
        </View>
      </SafeAreaView>
    );
  }

  if (!transaction) return null;

  const isIncome = transaction.type === "income";
  const amount = Number(transaction.amount);
  const date = transaction.transaction_date
    ? new Date(transaction.transaction_date).toLocaleDateString("en-GH", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Amount hero */}
        <View style={[styles.amountCard, { borderColor: isIncome ? "#DCFCE7" : "#FEE2E2" }]}>
          <View style={[styles.amountIconBox, { backgroundColor: isIncome ? "#DCFCE7" : "#FEE2E2" }]}>
            <Ionicons
              name={isIncome ? "arrow-up-outline" : "arrow-down-outline"}
              size={22}
              color={isIncome ? "#15803D" : "#C44736"}
            />
          </View>
          <Text style={[styles.amountValue, { color: isIncome ? "#15803D" : "#C44736" }]}>
            {isIncome ? "+ " : "− "}GH¢ {amount.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          <View style={[styles.typePill, { backgroundColor: isIncome ? "#DCFCE7" : "#FEE2E2" }]}>
            <Text style={[styles.typePillText, { color: isIncome ? "#15803D" : "#C44736" }]}>
              {isIncome ? "Income" : "Expense"}
            </Text>
          </View>
        </View>

        {/* Details card */}
        <View style={styles.card}>
          <Row label="Description" value={transaction.description ?? "—"} />
          <Divider />
          <Row label="Category" value={transaction.category ?? "—"} />
          <Divider />
          <Row label="Date" value={date} />
          <Divider />
          <Row label="Amount" value={`GH¢ ${amount.toLocaleString("en-GH", { minimumFractionDigits: 2 })}`} />
        </View>

        {/* Flags card */}
        {(transaction.tax_deductible || transaction.withholding_applicable) && (
          <View style={styles.card}>
            {transaction.tax_deductible && (
              <View style={styles.flagRow}>
                <View style={styles.flagIconBox}>
                  <Ionicons name="checkmark-circle" size={16} color="#0369A1" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.flagTitle}>Tax Deductible</Text>
                  <Text style={styles.flagSub}>This expense reduces your taxable income</Text>
                </View>
              </View>
            )}
            {transaction.tax_deductible && transaction.withholding_applicable && (
              <Divider />
            )}
            {transaction.withholding_applicable && (
              <View style={styles.flagRow}>
                <View style={[styles.flagIconBox, { backgroundColor: "#EDE9FE" }]}>
                  <Ionicons name="shield-checkmark-outline" size={16} color="#6D28D9" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.flagTitle}>Withholding Tax Applicable</Text>
                  <Text style={styles.flagSub}>WHT will be withheld on this transaction</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Actions */}
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => router.push(`/edit-transaction?id=${id}`)}
          activeOpacity={0.85}
        >
          <Ionicons name="create-outline" size={18} color="#FFFFFF" />
          <Text style={styles.editBtnText}>Edit Transaction</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => setShowDeleteModal(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="trash-outline" size={18} color="#C44736" />
          <Text style={styles.deleteBtnText}>Delete Transaction</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Delete confirmation */}
      <Modal visible={showDeleteModal} transparent animationType="fade" onRequestClose={() => setShowDeleteModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconBox}>
              <Ionicons name="trash-outline" size={24} color="#C44736" />
            </View>
            <Text style={styles.modalTitle}>Delete Transaction?</Text>
            <Text style={styles.modalText}>This action cannot be undone.</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowDeleteModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmDeleteButton} onPress={handleDelete} disabled={deleting}>
                <Text style={styles.confirmDeleteText}>{deleting ? "Deleting…" : "Delete"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F2EDE8" },

  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
  },

  headerTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#111827",
  },

  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 48,
  },

  // Amount hero
  amountCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1.5,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  amountIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  amountValue: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    marginBottom: 10,
    letterSpacing: -0.5,
  },

  typePill: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },

  typePillText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    textTransform: "capitalize",
  },

  // Details card
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 2,
  },

  rowLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    flex: 1,
  },

  rowValue: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#111827",
    flex: 2,
    textAlign: "right",
  },

  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 12,
  },

  // Flags
  flagRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 4,
  },

  flagIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#E0F2FE",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },

  flagTitle: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#111827",
    marginBottom: 2,
  },

  flagSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
  },

  // Action buttons
  editBtn: {
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

  editBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },

  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: "#FDECEC",
    borderRadius: 16,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
  },

  deleteBtnText: {
    color: "#C44736",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },

  // Modal
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
    backgroundColor: "#FDECEC",
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

  confirmDeleteButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#C44736",
    alignItems: "center",
  },

  confirmDeleteText: {
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
});

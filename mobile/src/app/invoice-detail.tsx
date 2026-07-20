import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import { router, useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useEffect, useState } from "react";
import ConfirmModal from "@/components/ConfirmModal";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useInvoices } from "@/context/InvoiceContext";
import { getInvoice, getInvoicePdf } from "@/services/invoices.service";
import { getUserFriendlyError } from "@/utils/error";
import { useToast } from "@/context/ToastContext";

const fmt = (n: number) =>
  `GH¢ ${(n ?? 0).toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("en-GH", { day: "numeric", month: "long", year: "numeric" }) : "—";

type StatusKey = "paid" | "cancelled" | "overdue" | "unpaid";

const STATUS_CONFIG: Record<StatusKey, { label: string; color: string; bg: string }> = {
  paid:      { label: "Paid",      color: "#16A34A", bg: "#DCFCE7" },
  cancelled: { label: "Cancelled", color: "#6B7280", bg: "#F3F4F6" },
  overdue:   { label: "Overdue",   color: "#DC2626", bg: "#FEE2E2" },
  unpaid:    { label: "Unpaid",    color: "#C44736", bg: "#FDECEC" },
};

function getStatusKey(status: string, dueDate?: string): StatusKey {
  if (status === "paid") return "paid";
  if (status === "cancelled") return "cancelled";
  if (dueDate && new Date(dueDate) < new Date()) return "overdue";
  return "unpaid";
}

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { showToast } = useToast();
  const { markPaid, cancel, send, refreshInvoices } = useInvoices();

  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getInvoice(id)
      .then((res) => setInvoice(res.data ?? res))
      .catch(() => showToast("Could not load invoice.", "error"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDownloadPdf = async () => {
    if (!id) return;
    setPdfLoading(true);
    try {
      const res = await getInvoicePdf(id);
      const pdfUrl: string = res.data?.pdf_url ?? res.pdf_url ?? "";
      if (!pdfUrl) {
        showToast("PDF is not available yet.", "info");
        return;
      }
      const localUri = `${FileSystem.cacheDirectory}taxpadi_invoice_${Date.now()}.pdf`;
      const { uri } = await FileSystem.downloadAsync(pdfUrl, localUri);
      await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: "Share Invoice" });
    } catch (error: any) {
      showToast(getUserFriendlyError(error), "error");
    } finally {
      setPdfLoading(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!id) return;
    setActionLoading("paid");
    try {
      await markPaid(id);
      setInvoice((prev: any) => ({ ...prev, status: "paid" }));
      await refreshInvoices(false);
      showToast("Invoice marked as paid.", "success");
    } catch (error: any) {
      showToast(getUserFriendlyError(error), "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    setShowCancelModal(false);
    setActionLoading("cancel");
    try {
      await cancel(id);
      setInvoice((prev: any) => ({ ...prev, status: "cancelled" }));
      await refreshInvoices(false);
      showToast("Invoice cancelled.", "success");
    } catch (error: any) {
      showToast(getUserFriendlyError(error), "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSend = async (channel: "email" | "whatsapp" | "download") => {
    if (!id) return;
    setActionLoading(`send-${channel}`);
    try {
      await send(id, channel);
      showToast(
        channel === "email" ? "Invoice sent via email." : channel === "whatsapp" ? "Invoice sent via WhatsApp." : "Invoice downloaded.",
        "success"
      );
    } catch (error: any) {
      showToast(getUserFriendlyError(error), "error");
    } finally {
      setActionLoading(null);
    }
  };

  const statusKey = invoice ? getStatusKey(invoice.status, invoice.due_date) : "unpaid";
  const cfg = STATUS_CONFIG[statusKey];
  const isUnpaid = invoice?.status === "unpaid" || invoice?.status === "pending";
  const subtotal = invoice?.subtotal ?? invoice?.sub_total ?? invoice?.amount ?? 0;
  const taxAmount = invoice?.tax_amount ?? invoice?.vat_amount ?? 0;
  const total = invoice?.total_amount ?? subtotal;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Invoice</Text>
        {invoice && isUnpaid ? (
          <TouchableOpacity
            onPress={() => router.push(`/create-invoice?id=${id}`)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="create-outline" size={22} color="#C44736" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 26 }} />
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#C44736" style={{ marginTop: 80 }} />
      ) : !invoice ? (
        <View style={styles.errorWrap}>
          <Text style={styles.errorText}>Could not load invoice.</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>Go back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* Ref + status */}
          <View style={styles.refRow}>
            <View>
              <Text style={styles.refLabel}>INVOICE REF</Text>
              <Text style={styles.refValue}>{invoice.invoice_ref ?? invoice.invoiceRef ?? "—"}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
              <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
            </View>
          </View>

          {/* Client card */}
          <View style={styles.card}>
            <Text style={styles.cardSectionLabel}>CLIENT</Text>
            <Text style={styles.clientName}>{invoice.client_name ?? "—"}</Text>
            {!!invoice.client_email && (
              <View style={styles.metaRow}>
                <Ionicons name="mail-outline" size={14} color="#9CA3AF" />
                <Text style={styles.metaText}>{invoice.client_email}</Text>
              </View>
            )}
            {!!invoice.client_phone && (
              <View style={styles.metaRow}>
                <Ionicons name="call-outline" size={14} color="#9CA3AF" />
                <Text style={styles.metaText}>{invoice.client_phone}</Text>
              </View>
            )}
          </View>

          {/* Description */}
          {!!invoice.description && (
            <View style={styles.card}>
              <Text style={styles.cardSectionLabel}>DESCRIPTION</Text>
              <Text style={styles.description}>{invoice.description}</Text>
            </View>
          )}

          {/* Amount breakdown */}
          <View style={styles.card}>
            <Text style={styles.cardSectionLabel}>AMOUNT</Text>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Subtotal</Text>
              <Text style={styles.amountValue}>{fmt(subtotal)}</Text>
            </View>
            {taxAmount > 0 && (
              <View style={styles.amountRow}>
                <Text style={styles.amountLabel}>Tax</Text>
                <Text style={styles.amountValue}>{fmt(taxAmount)}</Text>
              </View>
            )}
            <View style={styles.totalDivider} />
            <View style={styles.amountRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{fmt(total)}</Text>
            </View>
          </View>

          {/* Dates */}
          <View style={styles.card}>
            <Text style={styles.cardSectionLabel}>DATES</Text>
            <View style={styles.dateGrid}>
              <View style={styles.dateItem}>
                <Text style={styles.dateLabel}>Created</Text>
                <Text style={styles.dateValue}>{fmtDate(invoice.created_at)}</Text>
              </View>
              <View style={styles.dateItem}>
                <Text style={styles.dateLabel}>Due</Text>
                <Text style={[styles.dateValue, statusKey === "overdue" && { color: "#DC2626" }]}>
                  {fmtDate(invoice.due_date)}
                </Text>
              </View>
              {!!invoice.paid_at && (
                <View style={styles.dateItem}>
                  <Text style={styles.dateLabel}>Paid</Text>
                  <Text style={[styles.dateValue, { color: "#16A34A" }]}>{fmtDate(invoice.paid_at)}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Actions for unpaid */}
          {isUnpaid && (
            <View style={styles.actionCard}>
              <TouchableOpacity
                style={[styles.markPaidBtn, actionLoading === "paid" && { opacity: 0.7 }]}
                onPress={handleMarkPaid}
                disabled={!!actionLoading}
                activeOpacity={0.85}
              >
                <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
                <Text style={styles.markPaidText}>
                  {actionLoading === "paid" ? "Updating…" : "Mark as Paid"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cancelBtn, actionLoading === "cancel" && { opacity: 0.7 }]}
                onPress={() => setShowCancelModal(true)}
                disabled={!!actionLoading}
                activeOpacity={0.85}
              >
                <Text style={styles.cancelBtnText}>
                  {actionLoading === "cancel" ? "Cancelling…" : "Cancel Invoice"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Send + PDF row */}
          <View style={styles.bottomRow}>
            <TouchableOpacity
              style={[styles.sendBtn, actionLoading?.startsWith("send") && { opacity: 0.7 }]}
              onPress={() => handleSend("email")}
              disabled={!!actionLoading || pdfLoading}
              activeOpacity={0.85}
            >
              <Ionicons name="send-outline" size={16} color="#111827" />
              <Text style={styles.sendBtnText}>Send</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.pdfBtn, pdfLoading && { opacity: 0.7 }]}
              onPress={handleDownloadPdf}
              disabled={pdfLoading || !!actionLoading}
              activeOpacity={0.85}
            >
              <Ionicons name="document-outline" size={16} color="#FFFFFF" />
              <Text style={styles.pdfBtnText}>{pdfLoading ? "Loading…" : "Download PDF"}</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      )}

      <ConfirmModal
        visible={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        iconName="close-circle-outline"
        title="Cancel Invoice?"
        message="This action cannot be undone."
        cancelLabel="No, Keep It"
        confirmLabel="Yes, Cancel"
        onConfirm={handleCancel}
      />
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

  title: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#111827" },

  scroll: { paddingHorizontal: 20, paddingBottom: 48 },

  errorWrap: { alignItems: "center", marginTop: 80, gap: 12 },
  errorText: { fontSize: 15, fontFamily: "Inter_400Regular", color: "#6B7280" },
  backLink: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#C44736" },

  // Ref row
  refRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  refLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    color: "#9CA3AF",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  refValue: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#111827" },

  badge: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, marginTop: 4 },
  badgeText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  // Cards
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardSectionLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    color: "#9CA3AF",
    letterSpacing: 1.5,
    marginBottom: 10,
  },

  // Client
  clientName: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#111827", marginBottom: 8 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  metaText: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#6B7280" },

  // Description
  description: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#374151", lineHeight: 22 },

  // Amount
  amountRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  amountLabel: { fontSize: 14, fontFamily: "Inter_400Regular", color: "#6B7280" },
  amountValue: { fontSize: 14, fontFamily: "Inter_500Medium", color: "#111827" },
  totalDivider: { height: 1, backgroundColor: "#F3F4F6", marginVertical: 10 },
  totalLabel: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#111827" },
  totalValue: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#C44736" },

  // Dates
  dateGrid: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
  dateItem: { minWidth: "45%" },
  dateLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#9CA3AF", marginBottom: 3 },
  dateValue: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#111827" },

  // Actions
  actionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  markPaidBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#16A34A",
    borderRadius: 12,
    paddingVertical: 14,
    shadowColor: "#16A34A",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  markPaidText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#FFFFFF" },
  cancelBtn: {
    alignItems: "center",
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
  },
  cancelBtnText: { fontSize: 14, fontFamily: "Inter_500Medium", color: "#6B7280" },

  // Bottom row
  bottomRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  sendBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  sendBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#111827" },
  pdfBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#C44736",
    borderRadius: 12,
    paddingVertical: 14,
    shadowColor: "#C44736",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  pdfBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: "#FFFFFF" },

  // Cancel modal
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
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#EDE8E3",
    alignItems: "center",
  },
  modalCancelText: {
    fontFamily: "Inter_600SemiBold",
    color: "#111827",
    fontSize: 14,
  },
  modalConfirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#C44736",
    alignItems: "center",
  },
  modalConfirmText: {
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
});

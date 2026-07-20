import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { getUserFriendlyError } from "@/utils/error";
import {
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useInvoices } from "@/context/InvoiceContext";
import { getInvoice } from "@/services/invoices.service";
import { useNetwork } from "@/context/NetworkContext";
import { useToast } from "@/context/ToastContext";
import OfflineFormNotice from "@/components/OfflineFormNotice";

type CreatedInvoice = {
  invoiceId: string;
  invoiceRef: string;
  vatAmount: number;
  totalAmount: number;
  pdfUrl?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientName: string;
};

export default function CreateInvoiceScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!id;

  const { addInvoice, editInvoice, send } = useInvoices();
  const { isOnline } = useNetwork();
  const { showToast } = useToast();

  // Form state
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [issueDate] = useState(new Date());
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Pre-populate form when editing
  useEffect(() => {
    if (!id) return;
    getInvoice(id)
      .then((res) => {
        const inv = res.data ?? res;
        setClientName(inv.client_name ?? "");
        setClientEmail(inv.client_email ?? "");
        setClientPhone(inv.client_phone ?? "");
        setDescription(inv.description ?? "");
        const sub = inv.subtotal ?? inv.sub_total ?? inv.amount ?? 0;
        setAmount(sub > 0 ? String(sub) : "");
        if (inv.due_date) setDueDate(new Date(inv.due_date));
      })
      .catch(() => showToast("Could not load invoice details.", "error"));
  }, [id]);

  // Post-creation state
  const [created, setCreated] = useState<CreatedInvoice | null>(null);
  const [sentChannels, setSentChannels] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);

  const subtotal = parseFloat(amount.replace(/,/g, "")) || 0;

  const fmt = (n: number) =>
    `GH¢ ${n.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!clientName.trim()) e.clientName = "Client name is required.";
    if (clientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail))
      e.clientEmail = "Enter a valid email address.";
    if (!amount.trim() || subtotal <= 0) e.amount = "Enter a valid amount greater than zero.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!isOnline) { showToast("You're offline.", "info"); return; }
    if (!validate()) return;
    setSaving(true);
    try {
      if (isEditing && id) {
        await editInvoice(id, {
          client_name: clientName.trim(),
          client_email: clientEmail.trim() || undefined,
          client_phone: clientPhone.trim() || undefined,
          description: description.trim() || undefined,
          subtotal,
          due_date: dueDate.toISOString().split("T")[0],
        });
        showToast("Invoice updated.", "success");
        router.back();
      } else {
        const res = await addInvoice({
          client_name: clientName.trim(),
          client_email: clientEmail.trim() || undefined,
          client_phone: clientPhone.trim() || undefined,
          description: description.trim() || undefined,
          subtotal,
          due_date: dueDate.toISOString().split("T")[0],
        });
        setCreated({
          invoiceId: res?.data?.invoice_id ?? "",
          invoiceRef: res?.data?.invoice_ref ?? "Invoice",
          vatAmount: res?.data?.vat_amount ?? 0,
          totalAmount: res?.data?.total_amount ?? subtotal,
          pdfUrl: res?.data?.pdf_url,
          clientEmail: clientEmail.trim() || undefined,
          clientPhone: clientPhone.trim() || undefined,
          clientName: clientName.trim(),
        });
      }
    } catch (e: any) {
      showToast(getUserFriendlyError(e), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async (channel: "email" | "whatsapp" | "download") => {
    if (!created?.invoiceId) return;
    setSending(true);
    try {
      const res = await send(created.invoiceId, channel);
      const delivery = res?.data?.delivery;
      setSentChannels((prev) => new Set(prev).add(channel));

      if (channel === "whatsapp" && delivery?.whatsapp_link) {
        await Linking.openURL(delivery.whatsapp_link);
      } else if (channel === "download" && delivery?.download_url) {
        const localUri = `${FileSystem.cacheDirectory}taxpadi_invoice_${created?.invoiceRef ?? Date.now()}.pdf`;
        const { uri } = await FileSystem.downloadAsync(delivery.download_url, localUri);
        await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: "Share Invoice" });
      }
    } catch (e: any) {
      showToast(getUserFriendlyError(e), "error");
    } finally {
      setSending(false);
    }
  };

  // ── Success screen ──
  if (created) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScrollView contentContainerStyle={styles.successScroll} showsVerticalScrollIndicator={false}>
          <LinearGradient colors={["#C44736", "#8B2318"]} style={styles.successHero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <View style={styles.arcOuter} pointerEvents="none" />
            <View style={styles.arcInner} pointerEvents="none" />
            <View style={styles.successIconBox}>
              <Ionicons name="checkmark" size={28} color="#FFFFFF" />
            </View>
            <Text style={styles.successRef}>{created.invoiceRef}</Text>
            <Text style={styles.successLabel}>INVOICE CREATED</Text>
            <Text style={styles.successAmount}>{fmt(created.totalAmount)}</Text>
            {created.vatAmount > 0 && (
              <Text style={styles.successVat}>Includes GH¢ {created.vatAmount.toFixed(2)} VAT</Text>
            )}
          </LinearGradient>

          <View style={styles.sendCard}>
            <Text style={styles.sendCardTitle}>Send to {created.clientName}</Text>
            <Text style={styles.sendCardSubtitle}>Choose how to deliver this invoice.</Text>

            <SendOption
              icon="mail-outline"
              iconBg="#EFF6FF"
              iconColor="#2563EB"
              title="Send via Email"
              sub={created.clientEmail ?? "No email provided"}
              disabled={!created.clientEmail}
              sent={sentChannels.has("email")}
              loading={sending}
              onPress={() => handleSend("email")}
            />

            <SendOption
              icon="logo-whatsapp"
              iconBg="#F0FDF4"
              iconColor="#16A34A"
              title="Send via WhatsApp"
              sub={created.clientPhone ?? "No phone number provided"}
              disabled={!created.clientPhone}
              sent={sentChannels.has("whatsapp")}
              loading={sending}
              onPress={() => handleSend("whatsapp")}
            />

            {created.pdfUrl && (
              <SendOption
                icon="download-outline"
                iconBg="#FEF9C3"
                iconColor="#CA8A04"
                title="Download PDF"
                sub="Save or share the invoice PDF"
                disabled={false}
                sent={sentChannels.has("download")}
                loading={sending}
                onPress={() => handleSend("download")}
              />
            )}
          </View>

          <TouchableOpacity style={styles.doneBtn} onPress={() => router.replace("/(tabs)/invoices")} activeOpacity={0.85}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Create form ──
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>{isEditing ? "Edit Invoice" : "New Invoice"}</Text>
      </View>
      <Text style={styles.subtitle}>{isEditing ? "Update the invoice details below" : "Create and send professional invoices"}</Text>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.formScroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <OfflineFormNotice />
        {/* ── Client details ── */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>CLIENT DETAILS</Text>

          <Text style={styles.fieldLabel}>NAME *</Text>
          <TextInput
            style={[styles.input, errors.clientName && styles.inputError]}
            placeholder="e.g. Kofi Mensah Ltd"
            placeholderTextColor="#9CA3AF"
            value={clientName}
            onChangeText={(t) => { setClientName(t); if (errors.clientName) setErrors((e) => ({ ...e, clientName: "" })); }}
          />
          {errors.clientName ? <Text style={styles.fieldError}>{errors.clientName}</Text> : null}

          <Text style={styles.fieldLabel}>EMAIL (for email delivery)</Text>
          <TextInput
            style={[styles.input, errors.clientEmail && styles.inputError]}
            placeholder="client@example.com"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
            value={clientEmail}
            onChangeText={(t) => { setClientEmail(t); if (errors.clientEmail) setErrors((e) => ({ ...e, clientEmail: "" })); }}
          />
          {errors.clientEmail ? <Text style={styles.fieldError}>{errors.clientEmail}</Text> : null}

          <Text style={styles.fieldLabel}>PHONE (for WhatsApp delivery)</Text>
          <TextInput
            style={[styles.input, { marginBottom: 0 }]}
            placeholder="e.g. 0241234567"
            placeholderTextColor="#9CA3AF"
            keyboardType="phone-pad"
            value={clientPhone}
            onChangeText={setClientPhone}
          />
        </View>

        {/* ── Invoice details ── */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>INVOICE DETAILS</Text>

          <Text style={styles.fieldLabel}>DESCRIPTION</Text>
          <TextInput
            style={[styles.input, { minHeight: 80, textAlignVertical: "top" }]}
            placeholder="What is this invoice for?"
            placeholderTextColor="#9CA3AF"
            multiline
            value={description}
            onChangeText={setDescription}
          />

          <Text style={styles.fieldLabel}>AMOUNT (GH¢) *</Text>
          <View style={[styles.amountRow, errors.amount && styles.inputError]}>
            <Text style={styles.amountPrefix}>GH¢</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor="#9CA3AF"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={(t) => { setAmount(t); if (errors.amount) setErrors((e) => ({ ...e, amount: "" })); }}
            />
          </View>
          {errors.amount ? <Text style={styles.fieldError}>{errors.amount}</Text> : null}

          {subtotal > 0 && (
            <Text style={styles.vatNote}>
              VAT (21%) will be added if you are VAT registered — calculated by the server.
            </Text>
          )}
        </View>

        {/* ── Dates ── */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>DATES</Text>
          <View style={styles.dateRow}>
            <View style={styles.dateCard}>
              <Text style={styles.fieldLabel}>ISSUE DATE</Text>
              <Text style={styles.dateValue}>{issueDate.toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" })}</Text>
            </View>
            <TouchableOpacity style={[styles.dateCard, styles.dateCardTappable]} onPress={() => setShowDatePicker(true)} activeOpacity={0.8}>
              <Text style={styles.fieldLabel}>DUE DATE</Text>
              <Text style={styles.dateValue}>{dueDate.toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" })}</Text>
              <Ionicons name="calendar-outline" size={14} color="#9CA3AF" style={{ marginTop: 4 }} />
            </TouchableOpacity>
          </View>
          {showDatePicker && (
            <DateTimePicker
              value={dueDate}
              mode="date"
              minimumDate={new Date()}
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_, selected) => { setShowDatePicker(false); if (selected) setDueDate(selected); }}
            />
          )}
        </View>

        <TouchableOpacity style={[styles.createBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving} activeOpacity={0.88}>
          <Text style={styles.createBtnText}>
            {saving ? (isEditing ? "Saving…" : "Creating…") : (isEditing ? "Save Changes" : "Create Invoice")}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── SendOption component ──
function SendOption({
  icon, iconBg, iconColor, title, sub, disabled, sent, loading, onPress,
}: {
  icon: any; iconBg: string; iconColor: string;
  title: string; sub: string;
  disabled: boolean; sent: boolean; loading: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.sendOption, (disabled || loading) && { opacity: disabled ? 0.4 : 0.7 }]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      <View style={[styles.sendOptionIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={sent ? "checkmark" : icon} size={22} color={sent ? "#16A34A" : iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.sendOptionTitle}>{title}</Text>
        <Text style={styles.sendOptionSub}>{sub}</Text>
      </View>
      {sent ? (
        <View style={styles.sentBadge}>
          <Text style={styles.sentBadgeText}>Sent</Text>
        </View>
      ) : disabled ? null : (
        <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F2EDE8" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },

  title: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#111827", marginLeft: 10 },
  subtitle: { color: "#9CA3AF", fontSize: 13, fontFamily: "Inter_400Regular", paddingHorizontal: 20, marginBottom: 12 },

  formScroll: { paddingHorizontal: 20, paddingBottom: 48 },

  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  sectionHeading: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "#C44736",
    letterSpacing: 0.8,
    marginBottom: 14,
  },

  fieldLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    color: "#9CA3AF",
    letterSpacing: 0.6,
    marginBottom: 6,
  },

  input: {
    backgroundColor: "#F2EDE8",
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
    fontFamily: "Inter_400Regular",
    color: "#111827",
    fontSize: 14,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: "transparent",
  },

  inputError: { borderColor: "#EF4444" },

  fieldError: {
    color: "#EF4444",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: -10,
    marginBottom: 10,
  },

  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2EDE8",
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: "transparent",
  },

  amountPrefix: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#9CA3AF",
    marginRight: 8,
  },

  amountInput: {
    flex: 1,
    paddingVertical: 15,
    fontFamily: "Inter_400Regular",
    color: "#111827",
    fontSize: 22,
  },

  vatNote: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
    lineHeight: 18,
    marginTop: 4,
  },

  dateRow: { flexDirection: "row", gap: 12 },

  dateCard: { flex: 1, backgroundColor: "#F2EDE8", borderRadius: 12, padding: 14 },

  dateCardTappable: { borderWidth: 1.5, borderColor: "#E5E7EB" },

  dateValue: { color: "#111827", fontFamily: "Inter_600SemiBold", fontSize: 14, marginTop: 4 },

  createBtn: {
    backgroundColor: "#C44736",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: "#C44736",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
    marginBottom: -30
  },

  createBtnText: { color: "#FFFFFF", fontSize: 16, fontFamily: "Inter_600SemiBold", letterSpacing: -0.1 },

  successScroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 48 },

  successHero: {
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    marginBottom: 20,
    overflow: "hidden",
  },

  arcOuter: {
    position: "absolute", top: -60, right: -60,
    width: 200, height: 200, borderRadius: 100,
    borderWidth: 1.5, borderColor: "rgba(255,255,255,0.1)",
  },

  arcInner: {
    position: "absolute", top: -20, right: -20,
    width: 130, height: 130, borderRadius: 65,
    borderWidth: 1.5, borderColor: "rgba(255,255,255,0.07)",
  },

  successIconBox: {
    width: 56, height: 56, borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center", alignItems: "center", marginBottom: 16,
  },

  successRef: { color: "rgba(255,255,255,0.7)", fontSize: 13, fontFamily: "Inter_500Medium", letterSpacing: 0.5, marginBottom: 4 },
  successLabel: { color: "rgba(255,255,255,0.6)", fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1.2, marginBottom: 8 },
  successAmount: { color: "#FFFFFF", fontSize: 36, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  successVat: { color: "rgba(255,255,255,0.6)", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 6 },

  sendCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  sendCardTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#111827", marginBottom: 4 },
  sendCardSubtitle: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#9CA3AF", marginBottom: 20 },

  sendOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  sendOptionIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  sendOptionTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#111827", marginBottom: 2 },
  sendOptionSub: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#9CA3AF" },

  sentBadge: {
    backgroundColor: "#DCFCE7",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },

  sentBadgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold", color: "#16A34A" },

  doneBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(17,24,39,0.12)",
  },

  doneBtnText: { color: "#111827", fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
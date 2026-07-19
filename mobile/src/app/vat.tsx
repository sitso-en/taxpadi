import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import BottomSheet from "@/components/BottomSheet";
import { getVatStatus, getVatRecords, registerVat } from "@/services/vat.service";
import { usePrivacy } from "@/context/PrivacyContext";
import SubscriptionGate from "@/components/SubscriptionGate";
import { useSubscription } from "@/context/SubscriptionContext";
import { useToast } from "@/context/ToastContext";
import { getUserFriendlyError } from "@/utils/error";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const fmt = (n: number) =>
  `GH¢ ${n.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const statusColor = (s: string) => {
  if (s === "submitted" || s === "accepted") return "#16A34A";
  if (s === "rejected") return "#C44736";
  return "#D97706";
};

export default function VATScreen() {
  const { isPro } = useSubscription();
  const { amountsHidden, toggleAmountsHidden } = usePrivacy();
  const { showToast } = useToast();
  const [status, setStatus] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Registration modal
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [vatRegNo, setVatRegNo] = useState("");
  const [regDate, setRegDate] = useState(new Date());
  const [showRegDatePicker, setShowRegDatePicker] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [regError, setRegError] = useState("");

  const load = async () => {
    try {
      const statusRes = await getVatStatus();
      const s = statusRes.data;
      setStatus(s);
      if (s?.vat_registered) {
        const recordsRes = await getVatRecords();
        setRecords(recordsRes.data?.records ?? []);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (!isPro) return (
    <SubscriptionGate
      feature="VAT"
      description="Register for VAT, track your output and input tax, and manage monthly VAT obligations with the GRA."
      icon="calculator-outline"
    />
  );

  const handleRegister = async () => {
    if (!vatRegNo.trim()) { setRegError("Enter your VAT registration number."); return; }
    setRegistering(true);
    setRegError("");
    try {
      await registerVat({
        vat_registration_no: vatRegNo.trim(),
        registration_date: regDate.toISOString().split("T")[0],
      });
      setShowRegisterModal(false);
      showToast("VAT mode activated successfully.", "success");
      setLoading(true);
      await load();
    } catch (error: any) {
      setRegError(getUserFriendlyError(error));
    } finally {
      setRegistering(false);
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

  const threshold = status?.threshold;
  const current = status?.current_month;
  const outputVat = current?.output_vat ?? 0;
  const inputVat = current?.input_vat ?? 0;
  const netVat = current?.net_vat_liability ?? 0;
  const thresholdPct = Math.min(threshold?.percentage ?? 0, 100);

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
        <Text style={styles.title}>VAT</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#C44736" style={{ marginTop: 40 }} />
      ) : !status?.vat_registered ? (
        /* ─── NOT REGISTERED ─── */
        <>
          <View style={styles.unregisteredCard}>
            <View style={styles.unregisteredIconBox}>
              <Ionicons name="receipt-outline" size={28} color="#C44736" />
            </View>
            <Text style={styles.unregisteredTitle}>Not VAT Registered</Text>
            <Text style={styles.unregisteredSub}>
              Once you register with GRA, activate VAT mode here to track output/input VAT and filing deadlines automatically.
            </Text>
          </View>

          {threshold && (
            <View style={styles.infoCard}>
              <Text style={styles.thresholdLabel}>REVENUE THRESHOLD PROGRESS</Text>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
                <Text style={styles.thresholdCurrent}>
                  GH¢ {(threshold.current_revenue ?? 0).toLocaleString("en-GH")}
                </Text>
                <Text style={styles.thresholdLimit}>
                  of GH¢ {(threshold.limit ?? 200000).toLocaleString("en-GH")}
                </Text>
              </View>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${thresholdPct}%` as any,
                      backgroundColor: thresholdPct >= 80 ? "#C44736" : "#16A34A",
                    },
                  ]}
                />
              </View>
              <Text style={[styles.thresholdPct, { color: thresholdPct >= 80 ? "#C44736" : "#6B7280" }]}>
                {thresholdPct.toFixed(1)}% of threshold reached
              </Text>
              {threshold.warning && (
                <View style={styles.warningBanner}>
                  <Ionicons name="warning-outline" size={16} color="#92400E" />
                  <Text style={styles.warningText}>
                    {threshold.warning_message ?? "You are approaching the VAT registration threshold."}
                  </Text>
                </View>
              )}
              {threshold.estimated_months_to_threshold != null && (
                <Text style={styles.thresholdEstimate}>
                  Estimated time to threshold: {threshold.estimated_months_to_threshold} month{threshold.estimated_months_to_threshold !== 1 ? "s" : ""}
                </Text>
              )}
            </View>
          )}

          <TouchableOpacity style={styles.button} onPress={() => setShowRegisterModal(true)}>
            <Text style={styles.buttonText}>Register for VAT</Text>
          </TouchableOpacity>
        </>
      ) : (
        /* ─── REGISTERED ─── */
        <>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>VAT PAYABLE</Text>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}>
              <Text style={styles.summaryAmount}>
                {amountsHidden ? "••••••" : fmt(netVat)}
              </Text>
              <TouchableOpacity onPress={toggleAmountsHidden} style={{ marginLeft: 12 }}>
                <Ionicons
                  name={amountsHidden ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>
            {status?.vat_registration_no && (
              <Text style={styles.vatRegNo}>Reg. No: {status.vat_registration_no}</Text>
            )}
          </View>

          <View style={styles.infoCard}>
            <Row label="VAT Collected (Output)" value={amountsHidden ? "••••••" : fmt(outputVat)} />
            <Row label="VAT Paid (Input)" value={amountsHidden ? "••••••" : fmt(inputVat)} />
            <Row label="Net VAT Payable" value={amountsHidden ? "••••••" : fmt(netVat)} />
          </View>

          <Text style={styles.section}>VAT History</Text>

          {records.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No VAT records yet</Text>
              <Text style={styles.emptySubtitle}>
                VAT records are generated automatically when you add taxable transactions.
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push("/(tabs)/add-transaction")}
              >
                <Text style={styles.emptyButtonText}>Add a Transaction</Text>
              </TouchableOpacity>
            </View>
          ) : (
            records.map((item) => {
              const s = item.return_status ?? "pending";
              return (
                <View key={item.vat_id} style={styles.historyCard}>
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text style={styles.historyTitle}>
                      {MONTH_NAMES[item.month - 1]} {item.year}
                    </Text>
                    <Text style={[styles.historyStatus, { color: statusColor(s) }]}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                      {item.due_date
                        ? `  ·  Due ${new Date(item.due_date).toLocaleDateString("en-GH", { day: "numeric", month: "short" })}`
                        : ""}
                    </Text>
                  </View>
                  <Text style={styles.historyAmount}>
                    {amountsHidden ? "••••••" : fmt(item.net_vat_liability)}
                  </Text>
                </View>
              );
            })
          )}

          <TouchableOpacity style={styles.button} onPress={() => router.push("/payments")}>
            <Text style={styles.buttonText}>Submit VAT Return</Text>
          </TouchableOpacity>
        </>
      )}

      {/* VAT Registration Modal */}
      <BottomSheet visible={showRegisterModal} onClose={() => setShowRegisterModal(false)} avoidKeyboard>
        <View style={styles.sheetContent}>
            <Text style={styles.regTitle}>Register for VAT</Text>
            <Text style={styles.regSub}>
              Enter your GRA VAT registration details to activate VAT tracking in TaxPadi.
            </Text>

            <Text style={styles.fieldLabel}>VAT REGISTRATION NUMBER</Text>
            <TextInput
              style={[styles.fieldInput, regError ? styles.fieldInputError : null]}
              placeholder="e.g. C0123456789"
              placeholderTextColor="#9CA3AF"
              value={vatRegNo}
              onChangeText={(t) => { setVatRegNo(t); setRegError(""); }}
              autoCapitalize="characters"
            />

            <Text style={styles.fieldLabel}>REGISTRATION DATE</Text>
            <TouchableOpacity style={styles.fieldInput} onPress={() => setShowRegDatePicker(true)}>
              <Text style={{ color: "#374151", fontFamily: "Inter_400Regular" }}>
                {regDate.toLocaleDateString("en-GH", { day: "numeric", month: "long", year: "numeric" })}
              </Text>
            </TouchableOpacity>

            {showRegDatePicker && Platform.OS !== "web" && (
              <DateTimePicker
                value={regDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(_, d) => { setShowRegDatePicker(false); if (d) setRegDate(d); }}
                maximumDate={new Date()}
              />
            )}

            {regError ? <Text style={styles.fieldError}>{regError}</Text> : null}

            <TouchableOpacity
              style={[styles.button, { marginTop: 16 }, registering && { opacity: 0.7 }]}
              onPress={handleRegister}
              disabled={registering}
            >
              <Text style={styles.buttonText}>{registering ? "Registering…" : "Confirm Registration"}</Text>
            </TouchableOpacity>
        </View>
      </BottomSheet>
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
    marginLeft: 10,
    color: "#111827",
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
    fontFamily: "Inter_700Bold",
    marginBottom: 14,
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

  vatRegNo: {
    color: "rgba(255,255,255,0.7)",
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 8,
  },

  // Not-registered view
  unregisteredCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 24,
    marginBottom: 20,
    alignItems: "center",
  },
  unregisteredIconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#FDECEC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  unregisteredTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    marginBottom: 6,
  },
  unregisteredSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 19,
  },

  // Threshold progress
  thresholdLabel: {
    color: "#C44736",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  thresholdCurrent: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    color: "#111827",
  },
  thresholdLimit: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#6B7280",
  },
  progressTrack: {
    height: 8,
    backgroundColor: "#EDE8E3",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  thresholdPct: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    marginBottom: 12,
  },
  thresholdEstimate: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
  },
  warningBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#FEF3C7",
    borderRadius: 10,
    padding: 12,
    marginTop: 4,
  },
  warningText: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#92400E",
    lineHeight: 17,
  },

  sheetContent: {
    paddingHorizontal: 22,
    paddingBottom: 36,
  },
  regTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    marginBottom: 6,
  },
  regSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    marginBottom: 20,
    lineHeight: 18,
  },
  fieldLabel: {
    color: "#C44736",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  fieldInput: {
    backgroundColor: "#EDE8E3",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#111827",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  fieldInputError: {
    borderColor: "#EF4444",
  },
  fieldError: {
    color: "#EF4444",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: -10,
    marginBottom: 14,
  },
});
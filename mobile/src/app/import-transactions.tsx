import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as DocumentPicker from "expo-document-picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Dropdown } from "react-native-element-dropdown";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  importTransactions,
  validateTransactionImport,
  getTransactionImportHistory,
} from "@/services/transaction.service";
import { useTransactions } from "@/context/TransactionContext";
import { getUserFriendlyError } from "@/utils/error";
import { useToast } from "@/context/ToastContext";
import { useNetwork } from "@/context/NetworkContext";
import SubscriptionGate from "@/components/SubscriptionGate";
import { useSubscription } from "@/context/SubscriptionContext";

const providers = [
  { label: "MTN MoMo", value: "mtn" },
  { label: "Telecel / Vodafone", value: "vodafone" },
  { label: "AT / AirtelTigo", value: "airteltigo" },
  { label: "Ecobank", value: "ecobank" },
  { label: "GCB Bank", value: "gcb" },
  { label: "Fidelity Bank", value: "fidelity" },
  { label: "Absa", value: "absa" },
  { label: "CBG", value: "cbg" },
  { label: "MiWay Insurance", value: "miway" },
  { label: "PWC", value: "pwc" },
  { label: "Other", value: "other" },
];

export default function TransactionImportScreen() {
  const { isPro } = useSubscription();
  const { refreshTransactions } = useTransactions();
  const { showToast } = useToast();
  const { isOnline } = useNetwork();

  const [provider, setProvider] = useState("mtn");
  const [statementFrom, setStatementFrom] = useState(new Date());
  const [statementTo, setStatementTo] = useState(new Date());
  const [file, setFile] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  const [uploading, setUploading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [errors, setErrors] = useState<{file?: string; dateRange?: string}>({});

  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  // FIX: Shifted function declaration up here so it's fully allocated before mount hooks or early returns
  const loadHistory = async () => {
    try {
      const response = await getTransactionImportHistory();
      setHistory(response.data?.imports ?? response.imports ?? []);
    } catch {
      // Gracefully silence fetch failures on mount
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  if (!isPro) return (
    <SubscriptionGate
      feature="Import Transactions"
      description="Bulk import transactions from CSV files or bank statements to save time on data entry."
      icon="cloud-upload-outline"
    />
  );

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        type: ["text/csv", "application/pdf", "*/*"],
      });

      if (!result.canceled) {
        setFile(result.assets[0]);
        setErrors(e => ({ ...e, file: undefined }));
      }
    } catch {
    }
  };

  const validate = async () => {
    if (!isOnline) {
      showToast("You're offline. Connect to the internet to validate this statement.", "info");
      return;
    }
    if (!file) {
      setErrors(e => ({ ...e, file: "Select a statement file first." }));
      return;
    }

    if (validating) return;

    setValidating(true);

    try {
      const response = await validateTransactionImport(provider, file.uri, file.name, file.mimeType ?? "application/octet-stream");
      const data = response.data ?? response;
      const isSafe = data.safe_to_import;
      const count = data.total_transactions_detected ?? 0;

      // Auto-fill date range from what the backend detected in the CSV
      if (data.detected_from) setStatementFrom(new Date(data.detected_from));
      if (data.detected_to)   setStatementTo(new Date(data.detected_to));

      showToast(
        isSafe
          ? `Safe to import — ${count} transaction${count !== 1 ? "s" : ""} detected. Dates auto-filled.`
          : "Warning: this period overlaps a previous import.",
        isSafe ? "success" : "info"
      );
    } catch (error: any) {
      showToast(getUserFriendlyError(error), "error");
    } finally {
      setValidating(false);
    }
  };

  const importStatement = async () => {
    if (!isOnline) {
      showToast("You're offline. Connect to the internet to import this statement.", "info");
      return;
    }
    const newErrors: typeof errors = {};
    if (statementFrom > statementTo) newErrors.dateRange = "The start date cannot be after the end date.";
    if (!file) newErrors.file = "Select a statement file first.";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (uploading) return;

    setUploading(true);

    try {
      const fromStr = statementFrom.toISOString().split("T")[0];
      const toStr = statementTo.toISOString().split("T")[0];

      const response = await importTransactions(
        provider,
        fromStr,
        toStr,
        file.uri,
        file.name,
        file.mimeType ?? "application/octet-stream"
      );

      const count = response.data?.transactions_imported ?? response.transactions_imported ?? 0;

      showToast(`${count} transactions imported successfully. Tax calculations updated.`, "success");

      setFile(null);
      await loadHistory();
      await refreshTransactions();
    } catch (error: any) {
      showToast(getUserFriendlyError(error), "error");
    } finally {
      setUploading(false);
    }
  };

  const renderHistoryItem = ({ item }: { item: any }) => (
    <View style={styles.historyCard}>
      <View style={styles.historyHeader}>
        <Text style={styles.historyProvider}>
          {providers.find((p) => p.value === item.provider)?.label || item.provider.toUpperCase()}
        </Text>
        <Text style={styles.historyCount}>+{item.total_imported ?? 0}</Text>
      </View>
      <Text style={styles.historyMeta}>
        Range: {item.statement_from} to {item.statement_to}
      </Text>
      <Text style={styles.historyMeta}>
        Imported on: {new Date(item.imported_at || item.created_at).toLocaleDateString()}
      </Text>
    </View>
  );

  return (
    <FlatList
      data={history}
      keyExtractor={(item, index) =>
        item.import_id?.toString() ?? index.toString()
      }
      renderItem={renderHistoryItem}
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 48 }}
      ListHeaderComponent={
        <>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={26} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.title}>Import Statements</Text>
          </View>
          <Text style={styles.subtitle}>Parse bank or mobile money statements directly.</Text>

          {/* Form Card */}
          <View style={styles.card}>
            <Text style={styles.label}>PROVIDER</Text>
            <Dropdown
              style={styles.dropdown}
              data={providers}
              labelField="label"
              valueField="value"
              value={provider}
              onChange={(item) => setProvider(item.value)}
              placeholder="Select Provider"
              placeholderStyle={styles.dropdownPlaceholder}
              selectedTextStyle={styles.dropdownSelected}
              itemTextStyle={styles.dropdownSelected}
              containerStyle={styles.dropdownContainer}
              activeColor="#F2EDE8"
              iconColor="#9CA3AF"
            />

            {/* Date Range Selection */}
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.label}>FROM</Text>
                <TouchableOpacity
                  style={[styles.dateSelector, errors.dateRange && styles.inputError]}
                  onPress={() => { setShowFromPicker(true); if (errors.dateRange) setErrors(e => ({ ...e, dateRange: undefined })); }}
                >
                  <Text style={styles.dateText}>{statementFrom.toLocaleDateString()}</Text>
                </TouchableOpacity>
              </View>

              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.label}>TO</Text>
                <TouchableOpacity
                  style={[styles.dateSelector, errors.dateRange && styles.inputError]}
                  onPress={() => { setShowToPicker(true); if (errors.dateRange) setErrors(e => ({ ...e, dateRange: undefined })); }}
                >
                  <Text style={styles.dateText}>{statementTo.toLocaleDateString()}</Text>
                </TouchableOpacity>
              </View>
            </View>
            {errors.dateRange ? <Text style={styles.fieldError}>{errors.dateRange}</Text> : null}

            {showFromPicker && (
              <DateTimePicker
                value={statementFrom}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(e, date) => {
                  setShowFromPicker(false);
                  if (date) setStatementFrom(date);
                }}
              />
            )}

            {showToPicker && (
              <DateTimePicker
                value={statementTo}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(e, date) => {
                  setShowToPicker(false);
                  if (date) setStatementTo(date);
                }}
              />
            )}

            {/* Document Picker */}
            <Text style={styles.label}>STATEMENT FILE</Text>
            <TouchableOpacity
              style={[styles.fileButton, errors.file && styles.inputError, !!errors.file && { marginBottom: 4 }]}
              onPress={() => { pickFile(); if (errors.file) setErrors(e => ({ ...e, file: undefined })); }}
            >
              <Ionicons name="document-attach-outline" size={20} color="#6B7280" />
              <Text style={styles.fileButtonText} numberOfLines={1}>
                {file ? file.name : "Choose Statement File (CSV/PDF)"}
              </Text>
            </TouchableOpacity>
            {errors.file ? <Text style={styles.fieldError}>{errors.file}</Text> : null}

            {/* Validate tip */}
            <View style={styles.tipRow}>
              <Ionicons name="information-circle-outline" size={14} color="#6B7280" />
              <Text style={styles.tipText}>Validate your file first to check for conflicts before importing.</Text>
            </View>

            {/* Actions Block */}
            <View style={[styles.row, { marginTop: 8 }]}>
              <TouchableOpacity
                style={styles.validateButton}
                onPress={validate}
              >
                {validating ? (
                  <ActivityIndicator size="small" color="#111827" />
                ) : (
                  <Text style={styles.validateButtonText}>Validate</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.importButton}
                onPress={importStatement}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.importButtonText}>Import</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* History Header */}
          <Text style={styles.sectionHeading}>Import History</Text>
        </>
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Ionicons name="cloud-upload-outline" size={48} color="#9CA3AF" />
          <Text style={styles.emptyText}>No statements imported yet.</Text>
        </View>
      }
    />
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
    fontSize: 23,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    marginLeft: 10,
  },
  subtitle: {
    color: "#6B7280",
    fontSize: 13,
    marginBottom: 16,
    fontFamily: "Inter_400Regular",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  label: {
    color: "#9CA3AF",
    fontSize: 11,
    marginBottom: 8,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
  },
  dropdown: {
    backgroundColor: "#EDE8E3",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  dropdownPlaceholder: {
    color: "#9CA3AF",
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  dropdownSelected: {
    color: "#111827",
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  dropdownContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    overflow: "hidden",
    marginTop: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  dateSelector: {
    backgroundColor: "#EDE8E3",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  dateText: {
    color: "#111827",
    fontFamily: "Inter_500Medium",
  },
  fileButton: {
    flexDirection: "row",
    backgroundColor: "#EDE8E3",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#9CA3AF",
    marginBottom: 12,
  },
  fileButtonText: {
    marginLeft: 10,
    color: "#374151",
    flex: 1,
    fontFamily: "Inter_400Regular",
  },
  validateButton: {
    flex: 1,
    backgroundColor: "#EDE8E3",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  validateButtonText: {
    color: "#111827",
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  importButton: {
    flex: 1,
    backgroundColor: "#C44736",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  importButtonText: {
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  sectionHeading: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: "#4B5563",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  historyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  historyProvider: {
    fontFamily: "Inter_700Bold",
    color: "#111827",
  },
  historyCount: {
    color: "#10B981",
    fontFamily: "Inter_700Bold",
  },
  historyMeta: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
    fontFamily: "Inter_400Regular",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    color: "#6B7280",
    marginTop: 10,
    fontFamily: "Inter_400Regular",
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12,
  },
  tipText: {
    flex: 1,
    color: "#6B7280",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 17,
  },
  fieldError: {
    color: "#EF4444",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginBottom: 12,
  },
  inputError: {
    borderWidth: 1.5,
    borderColor: "#EF4444",
  },
});
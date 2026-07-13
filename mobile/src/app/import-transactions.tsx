import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as DocumentPicker from "expo-document-picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Dropdown } from "react-native-element-dropdown";
import {
  ActivityIndicator,
  Alert,
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

const providers = [
  { label: "MTN MoMo", value: "mtn" },
  { label: "Telecel / Vodafone", value: "vodafone" },
  { label: "AT / AirtelTigo", value: "airteltigo" },
  { label: "Ecobank", value: "ecobank" },
  { label: "GCB Bank", value: "gcb" },
  { label: "Fidelity Bank", value: "fidelity" },
];

export default function TransactionImportScreen() {
  const { refreshTransactions } = useTransactions();

  const [provider, setProvider] = useState("mtn");
  const [statementFrom, setStatementFrom] = useState(new Date());
  const [statementTo, setStatementTo] = useState(new Date());
  const [file, setFile] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  const [uploading, setUploading] = useState(false);
  const [validating, setValidating] = useState(false);

  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await getTransactionImportHistory();
      setHistory(response.data?.imports ?? response.imports ?? []);
    } catch (error) {
      console.log("Error loading history:", error);
    }
  };

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        type: ["text/csv", "application/pdf", "*/*"],
      });

      if (!result.canceled) {
        setFile(result.assets[0]);
      }
    } catch (error) {
      console.log("File pick error:", error);
    }
  };

  const validate = async () => {
    if (!file) {
      Alert.alert("Missing File", "Please select a statement file first.");
      return;
    }

    if (validating) return;

    setValidating(true);

    try {
      const response = await validateTransactionImport(provider, file.uri);
      const isSafe = response.data?.safe_to_import ?? response.safe_to_import;

      Alert.alert(
        "Validation Result",
        isSafe ? "Statement is safe to import." : "Warning: Import contains overlapping date ranges."
      );
    } catch (error: any) {
      Alert.alert(
        "Validation Failed",
        error?.response?.data?.message ??
          "Unable to validate the file."
      );
    } finally {
      setValidating(false);
    }
  };

  const importStatement = async () => {
    if (statementFrom > statementTo) {
      Alert.alert(
        "Invalid Date Range",
        "The start date cannot be after the end date."
      );
      return;
    }

    if (!file) {
      Alert.alert("Missing File", "Please select a statement file first.");
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
        file.uri
      );

      const count = response.data?.transactions_imported ?? response.transactions_imported ?? 0;

      Alert.alert(
        "Import Complete",
        `${count} transactions imported successfully.\nYour tax calculations have also been updated.`
      );

      setFile(null);
      await loadHistory();
      await refreshTransactions();
    } catch (error: any) {
      Alert.alert(
        "Import Failed",
        error?.response?.data?.message ??
          "Unable to import transactions."
      );
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
      contentContainerStyle={{ paddingBottom: 40 }}
      ListHeaderComponent={
        <>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#111827" />
            </TouchableOpacity>
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.title}>Import Statements</Text>
              <Text style={styles.subtitle}>Parse bank or mobile money statements directly.</Text>
            </View>
          </View>

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
            />

            {/* Date Range Selection */}
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.label}>FROM</Text>
                <TouchableOpacity style={styles.dateSelector} onPress={() => setShowFromPicker(true)}>
                  <Text style={styles.dateText}>{statementFrom.toLocaleDateString()}</Text>
                </TouchableOpacity>
              </View>

              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.label}>TO</Text>
                <TouchableOpacity style={styles.dateSelector} onPress={() => setShowToPicker(true)}>
                  <Text style={styles.dateText}>{statementTo.toLocaleDateString()}</Text>
                </TouchableOpacity>
              </View>
            </View>

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
            <TouchableOpacity style={styles.fileButton} onPress={pickFile}>
              <Ionicons name="document-attach-outline" size={20} color="#6B7280" />
              <Text style={styles.fileButtonText} numberOfLines={1}>
                {file ? file.name : "Choose Statement File (CSV/PDF)"}
              </Text>
            </TouchableOpacity>

            {/* Actions Block */}
            {uploading || validating ? (
              <ActivityIndicator size="large" color="#C44736" style={{ marginVertical: 16 }} />
            ) : (
              <View style={[styles.row, { marginTop: 8 }]}>
                <TouchableOpacity
                  style={styles.validateButton}
                  onPress={validate}
                  disabled={validating}
                >
                  <Text style={styles.validateButtonText}>
                    {validating ? "Validating..." : "Validate"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.importButton}
                  onPress={importStatement}
                  disabled={uploading}
                >
                  <Text style={styles.importButtonText}>
                    {uploading ? "Importing..." : "Import"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* History Header */}
          <Text style={styles.sectionHeading}>IMPORT HISTORY</Text>
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
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 20,
    paddingTop: 55,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: "#111827",
  },
  subtitle: {
    color: "#6B7280",
    fontSize: 13,
    marginTop: 2,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  label: {
    color: "#C44736",
    fontSize: 11,
    marginBottom: 8,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  dropdown: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  dateSelector: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  dateText: {
    color: "#111827",
  },
  fileButton: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
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
  },
  validateButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginRight: 8,
  },
  validateButtonText: {
    color: "#111827",
    fontWeight: "600",
  },
  importButton: {
    flex: 1,
    backgroundColor: "#C44736",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginLeft: 8,
  },
  importButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: "700",
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
    fontWeight: "700",
    color: "#111827",
  },
  historyCount: {
    color: "#10B981",
    fontWeight: "700",
  },
  historyMeta: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    color: "#6B7280",
    marginTop: 10,
  },
});
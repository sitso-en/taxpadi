import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import { useState, useEffect } from "react";
import { Dropdown } from "react-native-element-dropdown";
import { getUserFriendlyError } from "@/utils/error";
import ConfirmModal from "@/components/ConfirmModal";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { useToast } from "@/context/ToastContext";
import { useNetwork } from "@/context/NetworkContext";
import OfflineFormNotice from "@/components/OfflineFormNotice";
import {
  getTransaction,
  updateTransaction,
  deleteTransaction,
} from "@/services/transaction.service";

const categories = [
  { label: "Sales", value: "Sales" },
  { label: "Transport", value: "Transport" },
  { label: "Utilities", value: "Utilities" },
  { label: "Food", value: "Food" },
  { label: "Salary", value: "Salary" },
  { label: "Rent", value: "Rent" },
  { label: "Other", value: "Other" },
];

export default function EditTransactionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [taxDeductible, setTaxDeductible] = useState(false);
  const [withholdingApplicable, setWithholdingApplicable] = useState(false);
  const [date, setDate] = useState(new Date());

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { showToast } = useToast();
  const { isOnline } = useNetwork();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors] = useState<{ amount?: string; category?: string; description?: string }>({});

  useEffect(() => {
    loadTransaction();
  }, []);

  const loadTransaction = async () => {
    try {
      const response = await getTransaction(id);
      const t = response.data;
      setType(t.type);
      setAmount(String(t.amount));
      setCategory(t.category);
      setDescription(t.description);
      setTaxDeductible(t.tax_deductible);
      setWithholdingApplicable(t.withholding_applicable);
      setDate(new Date(t.transaction_date));
    } catch (error) {
      showToast(getUserFriendlyError(error), "error");
    } finally {
      setLoading(false);
    }
  };

  const saveChanges = async () => {
    const newErrors: typeof errors = {};
    if (!amount.trim() || Number(amount) <= 0) newErrors.amount = "Enter an amount greater than zero.";
    if (!category) newErrors.category = "Select a category.";
    if (!description.trim()) newErrors.description = "Enter a description.";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    if (!isOnline) { showToast("You're offline. Connect to save changes.", "info"); return; }
    if (saving) return;
    setSaving(true);
    try {
      await updateTransaction(id, {
        amount: Number(amount),
        category,
        description,
        tax_deductible: taxDeductible,
        withholding_applicable: withholdingApplicable,
        transaction_date: date.toISOString().split("T")[0],
      });
      showToast("Transaction updated.", "success");
      router.back();
    } catch (error: any) {
      showToast(getUserFriendlyError(error), "error");
    } finally {
      setSaving(false);
    }
  };

  const removeTransaction = async () => {
    if (!isOnline) { showToast("You're offline. Connect to delete.", "info"); return; }
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

  const isIncome = type === "income";

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Transaction</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <OfflineFormNotice />
        {/* Type indicator — read-only, type cannot change after creation */}
        <View style={[styles.typeBanner, { backgroundColor: isIncome ? "#DCFCE7" : "#FEE2E2" }]}>
          <Ionicons
            name={isIncome ? "arrow-up-circle-outline" : "arrow-down-circle-outline"}
            size={18}
            color={isIncome ? "#15803D" : "#C44736"}
          />
          <Text style={[styles.typeBannerText, { color: isIncome ? "#15803D" : "#C44736" }]}>
            {isIncome ? "Income" : "Expense"}
          </Text>
          <Text style={styles.typeBannerHint}>Type cannot be changed after creation</Text>
        </View>

        {/* Fields */}
        <Text style={styles.label}>DESCRIPTION</Text>
        <TextInput
          style={[styles.input, errors.description && styles.inputError]}
          value={description}
          onChangeText={(t) => { setDescription(t); if (errors.description) setErrors((e) => ({ ...e, description: undefined })); }}
          placeholder="What was this for?"
          placeholderTextColor="#9CA3AF"
          fontFamily="Inter_400Regular"
        />
        {errors.description ? <Text style={styles.fieldError}>{errors.description}</Text> : null}

        <Text style={styles.label}>AMOUNT (GHS)</Text>
        <TextInput
          style={[styles.input, errors.amount && styles.inputError]}
          value={amount}
          onChangeText={(t) => { setAmount(t); if (errors.amount) setErrors((e) => ({ ...e, amount: undefined })); }}
          keyboardType="numeric"
          placeholder="0.00"
          placeholderTextColor="#9CA3AF"
          fontFamily="Inter_400Regular"
        />
        {errors.amount ? <Text style={styles.fieldError}>{errors.amount}</Text> : null}

        <Text style={styles.label}>CATEGORY</Text>
        <Dropdown
          style={[styles.dropdown, errors.category && styles.inputError]}
          data={categories}
          labelField="label"
          valueField="value"
          value={category}
          placeholder="Select Category"
          placeholderStyle={styles.dropdownPlaceholder}
          selectedTextStyle={styles.dropdownSelected}
          itemTextStyle={styles.dropdownSelected}
          containerStyle={styles.dropdownContainer}
          activeColor="#F2EDE8"
          iconColor="#9CA3AF"
          onChange={(item) => { setCategory(item.value); if (errors.category) setErrors((e) => ({ ...e, category: undefined })); }}
        />
        {errors.category ? <Text style={styles.fieldError}>{errors.category}</Text> : null}

        {/* Toggles */}
        <TouchableOpacity
          style={[styles.toggle, taxDeductible && styles.toggleActive]}
          onPress={() => setTaxDeductible((v) => !v)}
          activeOpacity={0.8}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleTitle}>Tax Deductible</Text>
            <Text style={styles.toggleSub}>This expense reduces your taxable income</Text>
          </View>
          <View style={[styles.checkbox, taxDeductible && styles.checkboxActive]}>
            {taxDeductible && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggle, withholdingApplicable && styles.toggleActive]}
          onPress={() => setWithholdingApplicable((v) => !v)}
          activeOpacity={0.8}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleTitle}>Withholding Tax Applicable</Text>
            <Text style={styles.toggleSub}>WHT will be withheld on this transaction</Text>
          </View>
          <View style={[styles.checkbox, withholdingApplicable && styles.checkboxActive]}>
            {withholdingApplicable && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
          </View>
        </TouchableOpacity>

        {/* Save */}
        <TouchableOpacity
          style={[styles.saveButton, saving && { opacity: 0.7 }]}
          onPress={saveChanges}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>

        {/* Delete */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => setShowDeleteModal(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="trash-outline" size={18} color="#C44736" />
          <Text style={styles.deleteButtonText}>Delete Transaction</Text>
        </TouchableOpacity>
      </ScrollView>

      <ConfirmModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        iconName="trash-outline"
        title="Delete Transaction?"
        message="This action cannot be undone."
        confirmLabel={deleting ? "Deleting…" : "Delete"}
        onConfirm={removeTransaction}
        loading={deleting}
      />
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

  typeBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
  },

  typeBannerText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    textTransform: "capitalize",
  },

  typeBannerHint: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
    marginLeft: "auto",
  },

  label: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "#C44736",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 4,
  },

  input: {
    backgroundColor: "#EDE8E3",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 15,
    marginBottom: 16,
    fontSize: 14,
    color: "#111827",
    fontFamily: "Inter_400Regular",
    ...(Platform.OS === "web" ? { outlineWidth: 0 } : {}),
  },

  dropdown: {
    height: 52,
    backgroundColor: "#EDE8E3",
    borderRadius: 14,
    paddingHorizontal: 16,
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

  toggle: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EDE8E3",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: "transparent",
  },

  toggleActive: {
    backgroundColor: "#FDF0EE",
    borderColor: "#C44736",
  },

  toggleTitle: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "#111827",
    marginBottom: 2,
  },

  toggleSub: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
  },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: "#C4B5B0",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },

  checkboxActive: {
    backgroundColor: "#C44736",
    borderColor: "#C44736",
  },

  saveButton: {
    backgroundColor: "#C44736",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 12,
    shadowColor: "#C44736",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },

  deleteButton: {
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

  deleteButtonText: {
    color: "#C44736",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },

  fieldError: {
    color: "#EF4444",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: -12,
    marginBottom: 12,
  },

  inputError: {
    borderWidth: 1.5,
    borderColor: "#EF4444",
  },

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

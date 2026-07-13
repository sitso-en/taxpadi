import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import { useState, useEffect } from "react";
import { Dropdown } from "react-native-element-dropdown";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
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

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
      console.log(error);
      Alert.alert("Error", "Failed to load transaction.");
    } finally {
      setLoading(false);
    }
  };

  const saveChanges = async () => {
    if (!amount.trim()) {
      alert("Enter an amount.");
      return;
    }

    if (Number(amount) <= 0) {
      alert("Amount must be greater than zero.");
      return;
    }

    if (!category) {
      alert("Select a category.");
      return;
    }

    if (!description.trim()) {
      alert("Enter a description.");
      return;
    }

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

      Alert.alert("Success", "Transaction updated.");
      router.back();
    } catch (error: any) {
      alert(
        error?.response?.data?.message ??
        "Unable to update transaction."
      );
    } finally {
      setSaving(false);
    }
  };

  const removeTransaction = async () => {
    if (deleting) return;

    setDeleting(true);

    try {
      await deleteTransaction(id);
      setShowDeleteModal(false);
      Alert.alert("Deleted", "Transaction removed.");
      router.replace("/(tabs)/transactions");
    } catch (error: any) {
      alert(
        error?.response?.data?.message ??
        "Unable to delete transaction."
      );
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#C44736" />
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{
          paddingBottom: 40,
        }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.replace("/(tabs)/transactions")}
          >
            <Ionicons name="chevron-back" size={28} color="#222" />
          </TouchableOpacity>

          <Text style={styles.title}>Edit Transaction</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder="What was this for?"
          />

          <Text style={styles.label}>Amount (GHS)</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Category</Text>
          <Dropdown
            style={styles.input}
            data={categories}
            labelField="label"
            valueField="value"
            value={category}
            placeholder="Select Category"
            onChange={(item) => setCategory(item.value)}
          />
        </View>

        <Text style={styles.label}>Transaction Type</Text>
        <TouchableOpacity
          style={[
            styles.typeButton,
            type === "income" && styles.selectedTypeButton,
          ]}
          disabled={true} // Keep the parsed type static or remove disabled if toggling is allowed
        >
          <Ionicons
            name="arrow-up-circle-outline"
            size={20}
            color="#34A853"
          />
          <Text style={styles.typeText}>Income</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.typeButton,
            type === "expense" && styles.selectedTypeButton,
          ]}
          disabled={true}
        >
          <Ionicons
            name="arrow-down-circle-outline"
            size={20}
            color="#EA4335"
          />
          <Text style={styles.typeText}>Expense</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveChanges}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? "Saving..." : "Save Changes"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => setShowDeleteModal(true)}
          disabled={deleting}
        >
          <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
          <Text style={styles.deleteButtonText}>
            {deleting ? "Deleting..." : "Delete Transaction"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Ionicons name="warning-outline" size={48} color="#C44736" />

            <Text style={styles.modalTitle}>Delete Transaction?</Text>
            <Text style={styles.modalText}>This action cannot be undone.</Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmDeleteButton}
                onPress={removeTransaction}
                disabled={deleting}
              >
                <Text style={styles.confirmDeleteText}>
                  {deleting ? "Deleting..." : "Delete"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    padding: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginLeft: 10,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
    color: "#444",
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  typeButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  selectedTypeButton: {
    borderWidth: 2,
    borderColor: "#C44736",
  },
  typeText: {
    marginLeft: 10,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#C44736",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: "#EA4335",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 14,
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 28,
    width: "100%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 12,
    color: "#111827",
  },
  modalText: {
    color: "#6B7280",
    marginTop: 10,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    marginTop: 24,
    width: "100%",
    justifyContent: "space-between",
  },
  cancelButton: {
    width: "48%",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  confirmDeleteButton: {
    width: "48%",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#EA4335",
    alignItems: "center",
  },
  cancelText: {
    fontWeight: "600",
    color: "#111827",
  },
  confirmDeleteText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
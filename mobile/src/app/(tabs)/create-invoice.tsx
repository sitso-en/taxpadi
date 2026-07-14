import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useInvoices } from "../../context/InvoiceContext";

type LineItem = {
  id: number;
  description: string;
  quantity: string;
  unitPrice: string;
};

export default function CreateInvoiceScreen() {
  const { addInvoice } = useInvoices();

  const [customerName, setCustomerName] = useState("");

  const [invoiceNumber] = useState(
    `INV-${Date.now().toString().slice(-6)}`
  );

  const [issueDate] = useState(new Date());

  const [dueDate, setDueDate] = useState(new Date());

  const [showDatePicker, setShowDatePicker] =
    useState(false);

  const [feedbackText, setFeedbackText] =
    useState("");

  const [feedbackType, setFeedbackType] =
    useState<"error" | "success" | "">("");

  const [lineItems, setLineItems] =
    useState<LineItem[]>([
      {
        id: 1,
        description: "",
        quantity: "",
        unitPrice: "",
      },
    ]);

  // Calculations

  const subtotal = useMemo(() => {
    return lineItems.reduce((sum, item) => {
      const quantity =
        Number(item.quantity) || 0;

      const unitPrice =
        Number(item.unitPrice) || 0;

      return sum + quantity * unitPrice;
    }, 0);
  }, [lineItems]);

  const vat = subtotal * 0.15;

  const total = subtotal + vat;

  // Add new line item

  const addLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        description: "",
        quantity: "",
        unitPrice: "",
      },
    ]);
  };

  // Update line item

  const updateLineItem = (
    id: number,
    field: keyof LineItem,
    value: string
  ) => {
    setLineItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, [field]: value }
          : item
      )
    );
  };

  // Save invoice

  const saveInvoice = (
    status: "Draft" | "Sent"
  ) => {
    const hasInvalidItem =
      lineItems.some(
        (item) =>
          !item.description.trim() ||
          !item.quantity.trim() ||
          !item.unitPrice.trim()
      );

    if (
      !customerName.trim() ||
      hasInvalidItem
    ) {
      setFeedbackText(
        "Please complete all required fields."
      );

      setFeedbackType("error");

      return;
    }

    addInvoice({
      id: Date.now(),
      customerName,
      invoiceNumber,
      amount: total,
      issueDate: issueDate.toLocaleDateString(),
      dueDate: dueDate.toLocaleDateString(),
      status,
    });
    setFeedbackText(
      status === "Draft"
        ? "Invoice saved as draft."
        : "Invoice sent successfully."
    );

    setFeedbackType("success");

    setTimeout(() => {
      router.replace("/invoices");
    }, 1200);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingBottom: 120,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Feedback Card */}

      {feedbackText !== "" && (
        <View
          style={[
            styles.messageCard,
            feedbackType === "error"
              ? styles.errorCard
              : styles.successCard,
          ]}
        >
          <Ionicons
            name={
              feedbackType === "error"
                ? "alert-circle-outline"
                : "checkmark-circle-outline"
            }
            size={22}
            color={
              feedbackType === "error"
                ? "#C44736"
                : "#34A853"
            }
          />

          <Text
            style={[
              styles.messageText,
              {
                color:
                  feedbackType === "error"
                    ? "#C44736"
                    : "#34A853",
              },
            ]}
          >
            {feedbackText}
          </Text>
        </View>
      )}

      {/* Header */}

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() =>
            router.push("/invoices")
          }
        >
          <Ionicons
            name="chevron-back"
            size={26}
            color="#111827"
          />
        </TouchableOpacity>

        <View style={{ marginLeft: 10 }}>
          <Text style={styles.title}>New Invoice</Text>
          <Text style={styles.subtitle}>
            Create and send professional invoices.
          </Text>
        </View>
      </View>

      {/* Customer */}

      <Text style={styles.label}>
        CLIENT NAME
      </Text>

      <TextInput
        style={styles.input}
        placeholder="e.g. Kofi Mensah Ltd"
        placeholderTextColor="#9CA3AF"
        value={customerName}
        onChangeText={setCustomerName}
      />

      {/* Invoice Number */}

      <Text style={styles.label}>
        INVOICE NUMBER
      </Text>

      <TextInput
        style={styles.input}
        editable={false}
        value={invoiceNumber}
      />

      {/* Dates */}

      <View style={styles.dateRow}>
        <View style={styles.dateCard}>
          <Text style={styles.label}>
            ISSUE DATE
          </Text>

          <Text style={styles.dateText}>
            {issueDate.toLocaleDateString()}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.dateCard}
          onPress={() =>
            setShowDatePicker(true)
          }
        >
          <Text style={styles.label}>
            DUE DATE
          </Text>

          <Text style={styles.dateText}>
            {dueDate.toLocaleDateString()}
          </Text>
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={dueDate}
          mode="date"
          display={
            Platform.OS === "ios"
              ? "spinner"
              : "default"
          }
          onChange={(
            event,
            selectedDate
          ) => {
            setShowDatePicker(false);

            if (selectedDate) {
              setDueDate(selectedDate);
            }
          }}
        />
      )}

      {/* Line Items */}

      <Text style={styles.sectionTitle}>
        LINE ITEMS
      </Text>

      {lineItems.map((item, index) => {
        const amount =
          (Number(item.quantity) || 0) *
          (Number(item.unitPrice) || 0);

        return (
          <View
            key={item.id}
            style={styles.itemCard}
          >
            <Text style={styles.itemTitle}>
              Item {index + 1}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Description"
              value={item.description}
              onChangeText={(text) =>
                updateLineItem(
                  item.id,
                  "description",
                  text
                )
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Quantity"
              keyboardType="numeric"
              value={item.quantity}
              onChangeText={(text) =>
                updateLineItem(
                  item.id,
                  "quantity",
                  text
                )
              }
            />

            <TextInput
              style={styles.input}
              placeholder="Unit Price"
              keyboardType="numeric"
              value={item.unitPrice}
              onChangeText={(text) =>
                updateLineItem(
                  item.id,
                  "unitPrice",
                  text
                )
              }
            />

            <Text style={styles.amountText}>
              Amount: GH¢{" "}
              {amount.toFixed(2)}
            </Text>
          </View>
        );
      })}

      <TouchableOpacity
        style={styles.addItemButton}
        onPress={addLineItem}
      >
        <Text style={styles.addItemText}>
          + Add Line Item
        </Text>
      </TouchableOpacity>

      {/* Totals */}

      <View style={styles.totalSection}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>
            Subtotal
          </Text>

          <Text style={styles.totalValue}>
            GH¢ {subtotal.toFixed(2)}
          </Text>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>
            VAT (15%)
          </Text>

          <Text style={styles.totalValue}>
            GH¢ {vat.toFixed(2)}
          </Text>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.finalLabel}>
            Total
          </Text>

          <Text style={styles.finalAmount}>
            GH¢ {total.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Buttons */}

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.draftButton}
          onPress={() =>
            saveInvoice("Draft")
          }
        >
          <Text
            style={styles.draftButtonText}
          >
            Save Draft
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sendButton}
          onPress={() =>
            saveInvoice("Sent")
          }
        >
          <Text
            style={styles.sendButtonText}
          >
            Send Invoice
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 16,
    paddingTop: 44,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },

  title: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: "#111827",
  },

  subtitle: {
    color: "#6B7280",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },

  label: {
    color: "#C44736",
    fontSize: 11,
    marginBottom: 8,
    fontFamily: "Inter_600SemiBold",
  },

  input: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    fontFamily: "Inter_400Regular",
  },

  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  dateCard: {
    width: "48%",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 14,
  },

  dateText: {
    color: "#111827",
    fontFamily: "Inter_600SemiBold",
  },

  sectionTitle: {
    color: "#111827",
    fontSize: 16,
    marginBottom: 12,
    fontFamily: "Inter_700Bold",
  },

  itemCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ECECEC",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 2,
  },

  itemTitle: {
    color: "#111827",
    marginBottom: 12,
    fontFamily: "Inter_600SemiBold",
  },

  amountText: {
    color: "#C44736",
    fontFamily: "Inter_700Bold",
  },

  addItemButton: {
    backgroundColor: "#FFF5F3",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#F3C5BE",
  },

  addItemText: {
    color: "#C44736",
    fontFamily: "Inter_600SemiBold",
  },

  totalSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#ECECEC",
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  totalLabel: {
    color: "#6B7280",
    fontFamily: "Inter_400Regular",
  },

  totalValue: {
    color: "#111827",
    fontFamily: "Inter_600SemiBold",
  },

  finalLabel: {
    color: "#111827",
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },

  finalAmount: {
    color: "#C44736",
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  draftButton: {
    width: "47%",
    backgroundColor: "#ECECEC",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },

  draftButtonText: {
    color: "#111827",
    fontFamily: "Inter_600SemiBold",
  },

  sendButton: {
    width: "47%",
    backgroundColor: "#C44736",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 4,
  },

  sendButtonText: {
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
  },

  messageCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
  },

  errorCard: {
    backgroundColor: "#FDECEC",
  },

  successCard: {
    backgroundColor: "#E8F5E9",
  },

  messageText: {
    marginLeft: 10,
    flex: 1,
    fontFamily: "Inter_600SemiBold",
  },
});
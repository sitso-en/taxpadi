import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useReturns } from "../../context/ReturnContext";

export default function TaxScreen() {
  const { returns, addReturn, deleteReturn, editReturn } = useReturns();

  const [taxType, setTaxType] = useState("VAT");
  const [dueDate, setDueDate] = useState("");

  const filedReturns = returns.filter((r) => r.status === "Filed").length;

  const pendingReturns = returns.filter((r) => r.status === "Pending").length;

  const handleAddReturn = () => {
    if (!dueDate) return;

    addReturn({
      id: Date.now(),
      taxType,
      dueDate,
      status: "Pending",
    });

    setDueDate("");
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <Text style={styles.title}>My Taxes</Text>

      <View style={styles.taxCard}>
        <Text style={styles.taxLabel}>Outstanding Tax Due</Text>

        <Text style={styles.taxAmount}>
          GHS {(pendingReturns * 500).toFixed(2)}
        </Text>

        <Text style={styles.taxSubText}>Based on pending tax returns</Text>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Ionicons name="checkmark-circle-outline" size={24} color="#34A853" />

          <Text style={styles.summaryNumber}>{filedReturns}</Text>

          <Text style={styles.summaryLabel}>Filed</Text>
        </View>

        <View style={styles.summaryCard}>
          <Ionicons name="time-outline" size={24} color="#E65100" />

          <Text style={styles.summaryNumber}>{pendingReturns}</Text>

          <Text style={styles.summaryLabel}>Pending</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Compliance Status</Text>

        <Text
          style={{
            color: pendingReturns === 0 ? "#34A853" : "#E65100",
            fontWeight: "bold",
            fontSize: 18,
          }}
        >
          {pendingReturns === 0 ? "Good Standing" : "Action Required"}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Add Tax Return</Text>

        <Text style={styles.fieldLabel}>Tax Type</Text>

        <TouchableOpacity
          style={[
            styles.taxButton,
            taxType === "VAT" && styles.selectedTaxButton,
          ]}
          onPress={() => setTaxType("VAT")}
        >
          <Text style={styles.taxButtonText}>VAT Return</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.taxButton,
            taxType === "PAYE" && styles.selectedTaxButton,
          ]}
          onPress={() => setTaxType("PAYE")}
        >
          <Text style={styles.taxButtonText}>PAYE Return</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Due Date (e.g. 30 Jun 2026)"
          value={dueDate}
          onChangeText={setDueDate}
        />

        <TouchableOpacity style={styles.addButton} onPress={handleAddReturn}>
          <Text style={styles.addButtonText}>Add Return</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Return History</Text>

        {returns.length === 0 ? (
          <Text>No returns recorded</Text>
        ) : (
          returns.map((taxReturn) => (
            <View key={taxReturn.id} style={styles.returnItem}>
              <Text style={styles.returnType}>{taxReturn.taxType}</Text>

              <Text>Due Date: {taxReturn.dueDate}</Text>

              <Text
                style={{
                  color: taxReturn.status === "Filed" ? "#34A853" : "#E65100",
                  fontWeight: "bold",
                  marginTop: 6,
                }}
              >
                {taxReturn.status}
              </Text>

              {taxReturn.status !== "Filed" && (
                <TouchableOpacity
                  style={styles.filedButton}
                  onPress={() =>
                    editReturn({
                      ...taxReturn,
                      status: "Filed",
                    })
                  }
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={18}
                    color="#34A853"
                  />

                  <Text style={styles.filedText}>Mark as Filed</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteReturn(taxReturn.id)}
              >
                <Ionicons name="trash-outline" size={18} color="#C44736" />

                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    padding: 20,
    paddingTop: 50,
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
  },

  taxCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
  },

  taxLabel: {
    color: "#666",
  },

  taxAmount: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#111",
    marginTop: 8,
  },

  taxSubText: {
    color: "#888",
    marginTop: 6,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  summaryCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
  },

  summaryNumber: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 8,
  },

  summaryLabel: {
    color: "#666",
  },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },

  fieldLabel: {
    fontWeight: "600",
    marginBottom: 10,
  },

  taxButton: {
    backgroundColor: "#F5F5F5",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },

  selectedTaxButton: {
    borderWidth: 2,
    borderColor: "#C44736",
  },

  taxButtonText: {
    fontWeight: "600",
  },

  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 10,
    marginBottom: 12,
  },

  addButton: {
    backgroundColor: "#C44736",
    padding: 14,
    borderRadius: 12,
  },

  addButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "bold",
  },

  returnItem: {
    borderTopWidth: 1,
    borderColor: "#EEE",
    paddingTop: 12,
    marginTop: 12,
  },

  returnType: {
    fontWeight: "bold",
    fontSize: 16,
  },

  filedButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },

  filedText: {
    marginLeft: 6,
    color: "#34A853",
    fontWeight: "600",
  },

  deleteButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FCE8E6",
    padding: 10,
    borderRadius: 10,
    marginTop: 8,
  },

  deleteText: {
    marginLeft: 6,
    color: "#C44736",
    fontWeight: "600",
  },
});

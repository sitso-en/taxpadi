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
import { useReturns } from "../context/ReturnContext";

export default function TaxScreen() {
  const { returns, addReturn, deleteReturn, editReturn } = useReturns();

  const [taxType, setTaxType] = useState("");
  const [dueDate, setDueDate] = useState("");

  const filedReturns = returns.filter((r) => r.status === "Filed").length;

  const pendingReturns = returns.filter((r) => r.status === "Pending").length;

  const handleAddReturn = () => {
    if (!taxType || !dueDate) return;

    addReturn({
      id: Date.now(),
      taxType,
      dueDate,
      status: "Pending",
    });

    setTaxType("");
    setDueDate("");
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <Text style={styles.title}>My Taxes</Text>

      <View style={styles.taxCard}>
        <Text style={styles.taxLabel}>Tax Due</Text>

        <Text style={styles.taxAmount}>
          GHS {(pendingReturns * 500).toFixed(2)}
        </Text>

        <Text style={styles.taxSubText}>Outstanding tax obligations</Text>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Ionicons name="checkmark-circle-outline" size={24} color="#2E7D32" />
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
            color: pendingReturns === 0 ? "#2E7D32" : "#E65100",
            fontWeight: "bold",
            fontSize: 18,
          }}
        >
          {pendingReturns === 0 ? "Good Standing" : "Action Required"}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Add Tax Return</Text>

        <TextInput
          style={styles.input}
          placeholder="Tax Type"
          value={taxType}
          onChangeText={setTaxType}
        />

        <TextInput
          style={styles.input}
          placeholder="Due Date"
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
                  color: taxReturn.status === "Filed" ? "#2E7D32" : "#E65100",
                  fontWeight: "bold",
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
                  <Text style={[styles.buttonText, { color: "#2E7D32" }]}>
                    Mark as Filed
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteReturn(taxReturn.id)}
              >
                <Text style={[styles.buttonText, { color: "#C44736" }]}>
                  Delete
                </Text>
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
    backgroundColor: "#C44736",
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
  },

  taxLabel: {
    color: "#FFFFFF",
  },

  taxAmount: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "bold",
    marginTop: 8,
  },

  taxSubText: {
    color: "#FFFFFF",
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

  input: {
    backgroundColor: "#F5F5F5",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  addButton: {
    backgroundColor: "#C44736",
    padding: 14,
    borderRadius: 10,
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
  },

  filedButton: {
    backgroundColor: "#E8F5E9",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },

  deleteButton: {
    backgroundColor: "#FCE8E6",
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },

  buttonText: {
    textAlign: "center",
    fontWeight: "600",
  },
});

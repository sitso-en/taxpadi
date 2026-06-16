import { router } from "expo-router";
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

export default function TaxReturnsScreen() {
  const { returns, addReturn } = useReturns();

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
      contentContainerStyle={{ paddingBottom: 30 }}
    >
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>⬅️ Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Tax Returns</Text>
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
      <View style={styles.card}>
        <Text style={styles.returnTitle}>Returns Summary</Text>

        <Text>Filed: {filedReturns}</Text>

        <Text>Pending: {pendingReturns}</Text>

        <Text>
          Compliance Status:
          {pendingReturns === 0 ? " Good Standing" : " Action Required"}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.returnTitle}>Return History</Text>

        {returns.length === 0 ? (
          <Text>No returns recorded</Text>
        ) : (
          returns.map((taxReturn) => (
            <View
              key={taxReturn.id}
              style={{
                marginTop: 8,
                paddingTop: 8,
                borderTopWidth: 1,
                borderColor: "#EEE",
              }}
            >
              <Text>{taxReturn.taxType}</Text>
              <Text>Due Date: {taxReturn.dueDate}</Text>
              <Text>Status: {taxReturn.status}</Text>
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
    padding: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 50,
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },

  returnTitle: {
    fontWeight: "bold",
    marginBottom: 4,
  },

  backButton: {
    marginTop: 20,
    marginBottom: 10,
  },

  backText: {
    color: "#B83729",
    fontSize: 24,
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  addButton: {
    backgroundColor: "#B83729",
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
  },

  addButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "bold",
  },
});

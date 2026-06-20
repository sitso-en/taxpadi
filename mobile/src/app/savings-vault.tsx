import { Ionicons } from "@expo/vector-icons";
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

export default function SavingsVaultScreen() {
  const [goal, setGoal] = useState("Tax Reserve Fund");
  const [targetAmount, setTargetAmount] = useState("5000");
  const [savedAmount, setSavedAmount] = useState(1200);
  const [deposit, setDeposit] = useState("");

  const progress = (savedAmount / Number(targetAmount || 1)) * 100;

  const handleDeposit = () => {
    if (!deposit) return;

    setSavedAmount(savedAmount + Number(deposit));
    setDeposit("");
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#C44736" />
      </TouchableOpacity>

      <Text style={styles.title}>Savings Vault</Text>

      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>Current Savings</Text>

        <Text style={styles.heroAmount}>GHS {savedAmount.toFixed(2)}</Text>

        <Text style={styles.heroSubText}>Goal: {goal}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Savings Goal</Text>

        <TextInput
          style={styles.input}
          value={goal}
          onChangeText={setGoal}
          placeholder="Goal Name"
        />

        <TextInput
          style={styles.input}
          value={targetAmount}
          onChangeText={setTargetAmount}
          keyboardType="numeric"
          placeholder="Target Amount"
        />

        <Text>Progress: {progress.toFixed(0)}%</Text>

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(progress, 100)}%`,
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Add Savings</Text>

        <TextInput
          style={styles.input}
          value={deposit}
          onChangeText={setDeposit}
          keyboardType="numeric"
          placeholder="Amount"
        />

        <TouchableOpacity style={styles.button} onPress={handleDeposit}>
          <Ionicons name="wallet-outline" size={18} color="#FFFFFF" />

          <Text style={styles.buttonText}>Deposit Funds</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Recommendation</Text>

        <Text>
          Set aside part of your monthly income to cover future tax obligations
          and avoid penalties.
        </Text>
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

  heroCard: {
    backgroundColor: "#C44736",
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
  },

  heroLabel: {
    color: "#FFFFFF",
  },

  heroAmount: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "bold",
    marginTop: 8,
  },

  heroSubText: {
    color: "#FFFFFF",
    marginTop: 6,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
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

  progressBar: {
    height: 12,
    backgroundColor: "#E5E7EB",
    borderRadius: 999,
    marginTop: 10,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#34A853",
  },

  button: {
    backgroundColor: "#C44736",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    marginLeft: 8,
  },
  backButton: {
    marginBottom: 15,
  },
});

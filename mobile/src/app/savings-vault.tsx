import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useSavings } from "../context/SavingsContext";

export default function SavingsVaultScreen() {
  const {
    savings,
    totalSaved,
    addSaving,
    deleteSaving,
  } = useSavings();

  const [amount, setAmount] = useState("");
  const [selectedActivity, setSelectedActivity] = useState<number | null>(null);

  const [withdrawals, setWithdrawals] = useState<
    {
      id: number;
      amount: number;
      date: string;
    }[]
  >([]);

  const currentBalance =
    totalSaved -
    withdrawals.reduce(
      (sum, item) => sum + item.amount,
      0
    );

  const monthlySaved = useMemo(() => {
    const now = new Date();

    return savings
      .filter((saving) => {
        const date = new Date(saving.date);

        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      })
      .reduce(
        (sum, saving) => sum + saving.amount,
        0
      );
  }, [savings]);

  const suggestedAmount = Math.max(
    currentBalance * 0.2,
    100
  );

  const activity = useMemo(() => {
    const deposits = savings.map((saving) => ({
      id: saving.id,
      type: "Deposit",
      amount: saving.amount,
      date: saving.date,
      positive: true,
    }));

    const withdrawalsList = withdrawals.map((item) => ({
      id: item.id,
      type: "Withdrawal",
      amount: item.amount,
      date: item.date,
      positive: false,
    }));

    return [...deposits, ...withdrawalsList].sort(
      (a, b) =>
        new Date(b.date).getTime() -
        new Date(a.date).getTime()
    );
  }, [savings, withdrawals]);

  const handleDeposit = () => {
    const value = Number(amount);

    if (!amount.trim() || value <= 0) {
      Alert.alert(
        "Invalid Amount",
        "Enter a valid amount."
      );

      return;
    }

    addSaving(value);

    Alert.alert(
      "Deposit Successful",
      `GH¢ ${value.toFixed(
        2
      )} deposited successfully.`
    );

    setAmount("");
  };

  const handleWithdraw = () => {
    const value = Number(amount);

    if (!amount.trim() || value <= 0) {
      Alert.alert(
        "Invalid Amount",
        "Enter a valid amount."
      );

      return;
    }

    if (value > currentBalance) {
      Alert.alert(
        "Withdrawal Unsuccessful",
        `You only have GH¢ ${currentBalance.toFixed(
          2
        )} available in your Savings Vault.\n\nReduce the withdrawal amount or make another deposit before trying again.`
      );

      return;
    }

    setWithdrawals((prev) => [
      ...prev,
      {
        id: Date.now(),
        amount: value,
        date: new Date().toISOString(),
      },
    ]);

    Alert.alert(
      "Withdrawal Successful",
      `GH¢ ${value.toFixed(
        2
      )} withdrawn successfully.`
    );

    setAmount("");
  };

  const handleDeleteActivity = (id: number) => {
    console.log(
      "Delete tapped:",
      id,
      "deleteSaving type:",
      typeof deleteSaving
    );

    const isWithdrawal = withdrawals.some(
      (item) => item.id === id
    );

    if (isWithdrawal) {
      setWithdrawals((prev) =>
        prev.filter(
          (item) => item.id !== id
        )
      );
    } else {
      deleteSaving(id);
    }

    setSelectedActivity(null);
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: 120,
      }}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
        >
          <Ionicons
            name="chevron-back"
            size={26}
            color="#111827"
          />
        </TouchableOpacity>

        <Text style={styles.title}>
          Savings Vault
        </Text>
      </View>

      <View style={styles.heroCard}>
        <View style={styles.iconCircle}>
          <Ionicons
            name="wallet-outline"
            size={28}
            color="#C44736"
          />
        </View>

        <Text style={styles.heroLabel}>
          VAULT BALANCE
        </Text>

        <Text style={styles.heroAmount}>
          GH¢{" "}
          {currentBalance.toLocaleString()}
        </Text>

        <Text style={styles.heroSubText}>
          GH¢{" "}
          {monthlySaved.toFixed(2)} added this
          month
        </Text>
      </View>

      <View style={styles.suggestionCard}>
        <Ionicons
          name="bulb-outline"
          size={18}
          color="#F4B400"
        />

        <View
          style={{
            flex: 1,
            marginLeft: 10,
          }}
        >
          <Text
            style={styles.suggestionTitle}
          >
            Suggested savings
          </Text>

          <Text
            style={styles.suggestionText}
          >
            Based on your current vault
            activity.
          </Text>
        </View>

        <Text
          style={styles.suggestedAmount}
        >
          GH¢{" "}
          {suggestedAmount.toFixed(2)}
        </Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.depositButton}
          onPress={handleDeposit}
        >
          <Text
            style={
              styles.depositButtonText
            }
          >
            + Deposit
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={
            styles.withdrawButton
          }
          onPress={handleWithdraw}
        >
          <Text
            style={
              styles.withdrawButtonText
            }
          >
            - Withdraw
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Enter amount"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <Text
        style={styles.sectionTitle}
      >
        VAULT ACTIVITY
      </Text>

      {activity.length === 0 ? (
        <View
          style={
            styles.emptyActivity
          }
        >
          <Text>
            No vault activity yet.
          </Text>
        </View>
      ) : (
        activity.map((item) => (
          <View
            key={item.id}
            style={
              styles.activityWrapper
            }
          >
            {selectedActivity ===
              item.id && (
              <TouchableOpacity
                style={
                  styles.deleteButton
                }
                onPress={() =>
                  handleDeleteActivity(
                    item.id
                  )
                }
              >
                <Ionicons
                  name="trash-outline"
                  size={18}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() =>
                setSelectedActivity(
                  selectedActivity ===
                    item.id
                    ? null
                    : item.id
                )
              }
              style={[
                styles.activityItem,
                selectedActivity ===
                  item.id && {
                  transform: [
                    {
                      translateX: 45,
                    },
                  ],
                },
              ]}
            >
              <View>
                <Text
                  style={
                    styles.activityTitle
                  }
                >
                  {item.type}
                </Text>

                <Text
                  style={
                    styles.activityDate
                  }
                >
                  {new Date(
                    item.date
                  ).toLocaleDateString()}
                </Text>
              </View>

              <Text
                style={[
                  styles.activityAmount,
                  {
                    color:
                      item.positive
                        ? "#34A853"
                        : "#C44736",
                  },
                ]}
              >
                {item.positive
                  ? "+"
                  : "-"}
                GH¢{" "}
                {item.amount.toFixed(
                  2
                )}
              </Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 20,
    paddingTop: 44,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },

  title: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    marginLeft: 10,
  },

  heroCard: {
    backgroundColor: "#C44736",
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
    alignItems: "center",
  },

  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFFFFF20",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  heroLabel: {
    color: "#FDECEC",
    fontSize: 10,
    letterSpacing: 1,
    fontFamily: "Inter_600SemiBold",
  },

  heroAmount: {
    color: "#FFFFFF",
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    marginTop: 4,
  },

  heroSubText: {
    color: "#FDECEC",
    marginTop: 4,
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },

  suggestionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  suggestionTitle: {
    fontFamily: "Inter_600SemiBold",
    color: "#111827",
  },

  suggestionText: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 2,
  },

  suggestedAmount: {
    color: "#C44736",
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  depositButton: {
    width: "48%",
    backgroundColor: "#D95C4B",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
  },

  withdrawButton: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
  },

  depositButtonText: {
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
  },

  withdrawButtonText: {
    color: "#111827",
    fontFamily: "Inter_600SemiBold",
  },

  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 24,
  },

  sectionTitle: {
    color: "#C44736",
    fontSize: 11,
    marginBottom: 12,
    fontFamily: "Inter_600SemiBold",
  },

  activityWrapper: {
    position: "relative",
    marginBottom: 10,
    overflow: "visible",
  },

  deleteButton: {
    position: "absolute",
    left: 10,
    top: 18,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#C44736",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },

  activityItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 68,
  },

  activityTitle: {
    color: "#111827",
    fontFamily: "Inter_600SemiBold",
  },

  activityDate: {
    color: "#6B7280",
    marginTop: 4,
    fontSize: 12,
  },

  activityAmount: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },

  emptyActivity: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 24,
    alignItems: "center",
  },
});
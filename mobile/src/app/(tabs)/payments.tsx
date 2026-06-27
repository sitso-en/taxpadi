import React, {
  useMemo,
  useState,
} from "react";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useUser } from "../../context/UserContext";

import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { usePayments } from "../../context/PaymentContext";
import { useTransactions } from "../../context/TransactionContext";
import { useNotifications } from "../../context/NotificationContext";

import { Payment } from "../../data/payments";
import { Transaction } from "../../data/transactions";

export default function PaymentsScreen() {
  const { user } = useUser();
  const { payments, addPayment } =
    usePayments();

  const { transactions } =
    useTransactions();

  const { addNotification } =
    useNotifications();

  const [paymentMethod, setPaymentMethod] =
    useState<"momo" | "bank">(
      "momo"
    );

  const [processing, setProcessing] =
    useState(false);

  // Dynamic calculations

  const totalIncome = useMemo(
    () =>
      transactions
        .filter(
          (
            transaction: Transaction
          ) =>
            transaction.type ===
            "income"
        )
        .reduce(
          (
            sum: number,
            transaction: Transaction
          ) =>
            sum +
            transaction.amount,
          0
        ),
    [transactions]
  );

  const totalExpense = useMemo(
    () =>
      transactions
        .filter(
          (
            transaction: Transaction
          ) =>
            transaction.type ===
            "expense"
        )
        .reduce(
          (
            sum: number,
            transaction: Transaction
          ) =>
            sum +
            transaction.amount,
          0
        ),
    [transactions]
  );

  const taxDue =
    Math.max(
      totalIncome -
        totalExpense,
      0
    ) * 0.1;

  const penalties =
    taxDue * 0.15;

  const totalOutstanding =
    taxDue + penalties;

  const totalPaid =
    payments
      .filter(
        (payment: Payment) =>
          payment.status ===
          "Paid"
      )
      .reduce(
        (
          sum: number,
          payment: Payment
        ) =>
          sum + payment.amount,
        0
      );

  const remainingBalance =
    Math.max(
      totalOutstanding -
        totalPaid,
      0
    );

  const handlePayment = () => {
    if (processing) return;

    if (
      remainingBalance <= 0
    ) {
      Alert.alert(
        "No Outstanding Balance",
        "You currently have no outstanding payments."
      );

      return;
    }

    Alert.alert(
      "Confirm Payment",
      `Pay GH¢ ${remainingBalance.toFixed(
        2
      )} using ${
        paymentMethod === "momo"
          ? "Mobile Money"
          : "Bank Transfer"
      }?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },

        {
          text: "Pay",

          onPress: () => {
            setProcessing(true);

            const newPayment: Payment =
              {
                id: Date.now(),

                description:
                  paymentMethod ===
                  "momo"
                    ? "Mobile Money Payment"
                    : "Bank Transfer",

                amount:
                  remainingBalance,

                date:
                  new Date().toISOString(),

                status: "Paid",
              };

            addPayment(
              newPayment
            );

            addNotification(
              "Payment Successful",
              `You successfully paid GH¢ ${remainingBalance.toFixed(
                2
              )} via ${
                paymentMethod ===
                "momo"
                  ? "Mobile Money"
                  : "Bank Transfer"
              }.`
            );

            setProcessing(
              false
            );

            Alert.alert(
              "Success",
              "Payment completed successfully."
            );
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={
        false
      }
      contentContainerStyle={{
        paddingBottom: 120,
      }}
    >
      {/* Header */}

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() =>
            router.back()
          }
        >
          <Ionicons
            name="chevron-back"
            size={26}
            color="#111827"
          />
        </TouchableOpacity>

        <Text style={styles.title}>
          Payments
        </Text>
      </View>

      {/* Outstanding */}

      <View
        style={styles.balanceCard}
      >
        <Text
          style={
            styles.balanceLabel
          }
        >
          TOTAL OUTSTANDING
        </Text>

        <Text
          style={
            styles.balanceAmount
          }
        >
          GH¢{" "}
          {remainingBalance.toFixed(
            2
          )}
        </Text>

        <Text
          style={
            styles.balanceSubText
          }
        >
          Tax: GH¢{" "}
          {taxDue.toFixed(2)}
          {" • "}
          Penalties: GH¢{" "}
          {penalties.toFixed(
            2
          )}
        </Text>
      </View>
            {/* Payment Method */}

      <Text
        style={styles.sectionLabel}
      >
        PAYMENT METHOD
      </Text>

      <View
        style={
          styles.methodContainer
        }
      >
        <TouchableOpacity
          style={[
            styles.methodButton,
            paymentMethod ===
              "momo" &&
              styles.selectedMethod,
          ]}
          onPress={() =>
            setPaymentMethod(
              "momo"
            )
          }
        >
          <Ionicons
            name="phone-portrait-outline"
            size={18}
            color={
              paymentMethod ===
              "momo"
                ? "#C44736"
                : "#6B7280"
            }
          />

          <Text
            style={
              paymentMethod ===
              "momo"
                ? styles.selectedMethodText
                : styles.methodText
            }
          >
            Mobile Money
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.methodButton,
            paymentMethod ===
              "bank" &&
              styles.selectedMethod,
          ]}
          onPress={() =>
            setPaymentMethod(
              "bank"
            )
          }
        >
          <Ionicons
            name="business-outline"
            size={18}
            color={
              paymentMethod ===
              "bank"
                ? "#C44736"
                : "#6B7280"
            }
          />

          <Text
            style={
              paymentMethod ===
              "bank"
                ? styles.selectedMethodText
                : styles.methodText
            }
          >
            Bank Transfer
          </Text>
        </TouchableOpacity>
      </View>

      {/* Account Details */}

     <View style={styles.numberCard}>
  <Text style={styles.numberLabel}>
    {paymentMethod === "momo"
      ? "MOMO NUMBER"
      : "BANK ACCOUNT"}
  </Text>

  <Text style={styles.numberText}>
    {paymentMethod === "momo"
      ? user.phoneNumber || "No phone number available"
      : `${user.fullName || "TaxPadi User"} • ${
          user.email || "No email available"
        }`}
  </Text>
</View>

      {/* Pay Button */}

      <TouchableOpacity
        disabled={
          processing ||
          remainingBalance <= 0
        }
        style={[
          styles.payButton,

          remainingBalance <=
            0 && {
            backgroundColor:
              "#9CA3AF",
          },
        ]}
        onPress={
          handlePayment
        }
      >
        <Text
          style={
            styles.payButtonText
          }
        >
          {processing
            ? "Processing..."
            : remainingBalance >
              0
            ? `Pay GH¢ ${remainingBalance.toFixed(
                2
              )}`
            : "Nothing To Pay"}
        </Text>
      </TouchableOpacity>

      {/* History */}

      <Text
        style={styles.sectionLabel}
      >
        PAYMENT HISTORY
      </Text>

      <View
        style={styles.historyCard}
      >
        {payments.length ===
        0 ? (
          <Text
            style={{
              textAlign:
                "center",
              color:
                "#6B7280",
            }}
          >
            No payment history
            available.
          </Text>
        ) : (
          payments
            .slice()
            .reverse()
            .map(
              (
                item: Payment
              ) => (
                <View
                  key={item.id}
                  style={
                    styles.historyRow
                  }
                >
                  <View
                    style={
                      styles.leftSection
                    }
                  >
                    <View
                      style={
                        styles.dot
                      }
                    />

                    <View>
                      <Text
                        style={
                          styles.historyTitle
                        }
                      >
                        {
                          item.description
                        }
                      </Text>

                      <Text
                        style={
                          styles.historyRef
                        }
                      >
                        Ref:
                        PAY-
                        {item.id}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={
                      styles.rightSection
                    }
                  >
                    <Text
                      style={
                        styles.historyAmount
                      }
                    >
                      GH¢{" "}
                      {item.amount.toFixed(
                        2
                      )}
                    </Text>

                    <Text style={styles.historyDate}>
  {new Date(item.date).toLocaleString("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
})}
</Text>
                  </View>
                </View>
              )
            )
        )}
      </View>
    </ScrollView>
  );
}
const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        "#FAFAFA",
      paddingHorizontal: 20,
      paddingTop: 55,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 24,
    },

    title: {
      fontSize: 28,
      color: "#111827",
      fontFamily:
        "Inter_700Bold",
      marginLeft: 8,
    },

    balanceCard: {
      backgroundColor:
        "#C44736",
      borderRadius: 18,
      padding: 22,
      marginBottom: 24,
    },

    balanceLabel: {
      color: "#FDECEC",
      fontSize: 11,
      fontFamily:
        "Inter_600SemiBold",
    },

    balanceAmount: {
      color: "#FFFFFF",
      fontSize: 34,
      fontFamily:
        "Inter_700Bold",
      marginTop: 8,
    },

    balanceSubText: {
      color: "#FDECEC",
      marginTop: 8,
      fontFamily:
        "Inter_400Regular",
    },

    sectionLabel: {
      color: "#C44736",
      fontSize: 11,
      marginBottom: 10,
      fontFamily:
        "Inter_600SemiBold",
    },

    methodContainer: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      marginBottom: 20,
    },

    methodButton: {
      flex: 1,
      backgroundColor:
        "#F3F4F6",
      padding: 14,
      borderRadius: 12,
      flexDirection: "row",
      justifyContent:
        "center",
      alignItems: "center",
      marginHorizontal: 4,
    },

    selectedMethod: {
      borderWidth: 1.5,
      borderColor:
        "#C44736",
      backgroundColor:
        "#FFF5F3",
    },

    selectedMethodText: {
      color: "#C44736",
      marginLeft: 6,
      fontFamily:
        "Inter_600SemiBold",
      fontSize: 12,
    },

    methodText: {
      color: "#6B7280",
      marginLeft: 6,
      fontFamily:
        "Inter_500Medium",
      fontSize: 12,
    },

    numberCard: {
      backgroundColor:
        "#F3F4F6",
      borderRadius: 14,
      padding: 18,
      marginBottom: 24,
    },

    numberLabel: {
      color: "#C44736",
      fontSize: 10,
      fontFamily:
        "Inter_600SemiBold",
    },

    numberText: {
      color: "#111827",
      marginTop: 8,
      fontFamily:
        "Inter_500Medium",
    },

    payButton: {
      backgroundColor:
        "#C44736",
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
      marginBottom: 30,
    },

    payButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontFamily:
        "Inter_600SemiBold",
    },

    historyCard: {
      backgroundColor:
        "#FFFFFF",
      borderRadius: 16,
      padding: 18,
    },

    historyRow: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      marginBottom: 22,
    },

    leftSection: {
      flexDirection: "row",
      alignItems: "center",
    },

    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor:
        "#34A853",
      marginRight: 10,
      marginTop: 6,
    },

    historyTitle: {
      color: "#111827",
      fontFamily:
        "Inter_600SemiBold",
    },

    historyRef: {
      color: "#6B7280",
      fontSize: 11,
      marginTop: 3,
    },

    rightSection: {
      alignItems: "flex-end",
    },

    historyAmount: {
      color: "#111827",
      fontFamily:
        "Inter_600SemiBold",
    },

    historyDate: {
      color: "#6B7280",
      fontSize: 11,
      marginTop: 3,
    },
  });
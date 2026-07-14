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

import Card from "../../components/Card";
import { usePayments } from "../../context/PaymentContext";
import { useTransactions } from "../../context/TransactionContext";

import { Transaction } from "../../data/transactions";

export default function PaymentsScreen() {
  const { user } = useUser();
  const {
    payments,
    loading,
    createPayment,
    refreshPayments,
  } = usePayments();
  const { transactions } = useTransactions();

  const [paymentMethod, setPaymentMethod] = useState<"momo" | "bank">("momo");
  const [paying, setPaying] = useState(false);

  const totalIncome = useMemo(
    () =>
      transactions
        .filter((transaction: Transaction) => transaction.type === "income")
        .reduce((sum: number, transaction: Transaction) => sum + transaction.amount, 0),
    [transactions]
  );

  const totalExpense = useMemo(
    () =>
      transactions
        .filter((transaction: Transaction) => transaction.type === "expense")
        .reduce((sum: number, transaction: Transaction) => sum + transaction.amount, 0),
    [transactions]
  );

  const taxDue = Math.max(totalIncome - totalExpense, 0) * 0.1;
  const penalties = taxDue * 0.15;
  const totalOutstanding = taxDue + penalties;

  const totalPaid = payments
    .filter(
      (payment: any) =>
        payment.status?.toUpperCase() === "SUCCESS" ||
        payment.status?.toUpperCase() === "PAID"
    )
    .reduce(
      (sum: number, payment: any) =>
        sum + Number(payment.amount),
      0
    );

  const remainingBalance = Math.max(totalOutstanding - totalPaid, 0);

  const handlePayment = () => {
    if (paying) return;

    if (remainingBalance <= 0) {
      Alert.alert(
        "No Outstanding Balance",
        "You currently have no outstanding payments."
      );
      return;
    }

    Alert.alert(
      "Confirm Payment",
      `Pay GH¢ ${remainingBalance.toFixed(2)} using ${
        paymentMethod === "momo" ? "Mobile Money" : "Bank Transfer"
      }?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Pay",
          onPress: async () => {
            if (paying) return;

            setPaying(true);

            try {
              const response = await createPayment({
                amount: remainingBalance,
                payment_method:
                  paymentMethod === "momo"
                    ? "MOBILE_MONEY"
                    : "BANK_TRANSFER",

                momo_number: "",

                momo_provider:
                  paymentMethod === "momo"
                    ? "MTN"
                    : undefined,
              });

              await refreshPayments();

              if (
                response.data?.authorization_url
              ) {
                Alert.alert(
                  "Continue Payment",
                  response.data.authorization_url
                );
              }

              router.push("/receipt");
            } catch (error: any) {
              console.log(error);

              Alert.alert(
                "Payment Failed",
                error?.response?.data?.message ??
                  "Unable to initiate payment."
              );
            } finally {
              setPaying(false);
            }
          },
        },
      ]
    );
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
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color="#111827" />
        </TouchableOpacity>

        <Text style={styles.title}>Payments</Text>
      </View>

      <Text style={styles.subtitle}>
        Manage your tax payments and payment history.
      </Text>

      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <View style={styles.balanceIcon}>
            <Ionicons name="card-outline" size={32} color="#FFFFFF" />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.balanceLabel}>TOTAL OUTSTANDING</Text>
            <Text style={styles.currencyLabel}>GH¢</Text>
            <Text style={styles.balanceAmount}>
              {remainingBalance.toFixed(2)}
            </Text>
          </View>
        </View>

        <Text style={styles.balanceSubText}>
          Tax: GH¢ {taxDue.toFixed(2)} • Penalties: GH¢ {penalties.toFixed(2)}
        </Text>
      </View>

      <Text style={styles.sectionLabel}>PAYMENT METHOD</Text>

      <View style={styles.methodContainer}>
        <TouchableOpacity
          style={[
            styles.methodButton,
            paymentMethod === "momo" && styles.selectedMethod,
          ]}
          onPress={() => setPaymentMethod("momo")}
        >
          <Ionicons
            name="phone-portrait-outline"
            size={18}
            color={paymentMethod === "momo" ? "#C44736" : "#6B7280"}
          />
          <Text
            style={
              paymentMethod === "momo"
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
            paymentMethod === "bank" && styles.selectedMethod,
          ]}
          onPress={() => setPaymentMethod("bank")}
        >
          <Ionicons
            name="business-outline"
            size={18}
            color={paymentMethod === "bank" ? "#C44736" : "#6B7280"}
          />
          <Text
            style={
              paymentMethod === "bank"
                ? styles.selectedMethodText
                : styles.methodText
            }
          >
            Bank Transfer
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.numberCard}>
        <Text style={styles.numberLabel}>
          {paymentMethod === "momo" ? "MOMO NUMBER" : "BANK ACCOUNT"}
        </Text>

        <Text style={styles.numberText}>
          {paymentMethod === "momo"
            ? "Phone number will be loaded after authentication integration."
            : `${user?.fullName || "TaxPadi User"} • ${
                user?.category || "No email available"
              }`}
        </Text>
      </View>

      <TouchableOpacity
        disabled={paying || remainingBalance <= 0}
        style={[
          styles.payButton,
          remainingBalance <= 0 && { backgroundColor: "#9CA3AF" },
        ]}
        onPress={handlePayment}
      >
        <Text style={styles.payButtonText}>
          {paying
            ? "Processing..."
            : remainingBalance > 0
            ? `Pay GH¢ ${remainingBalance.toFixed(2)}`
            : "Nothing To Pay"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.sectionLabel}>PAYMENT HISTORY</Text>

      {payments.length === 0 ? (
        <Card style={styles.emptyStateCard}>
          <Ionicons
            name="wallet-outline"
            size={48}
            color="#9CA3AF"
            style={{ marginBottom: 12 }}
          />
          <Text style={styles.emptyStateTitle}>No Payments Yet</Text>
          <Text style={styles.emptyStateSubtitle}>
            Completed payments will appear here.
          </Text>
        </Card>
      ) : (
        payments
          .slice()
          .reverse()
          .map((item: any) => (
            <Card key={item.payment_id} style={styles.historyCard}>
              <View style={styles.historyRow}>
                <View style={styles.leftSection}>
                  <View style={styles.dot} />
                  <View>
                    <Text style={styles.historyTitle}>{item.payment_method}</Text>
                    <Text style={styles.historyRef}>Ref: {item.payment_reference}</Text>
                  </View>
                </View>

                <View style={styles.rightSection}>
                  <Text style={styles.historyAmount}>
                    GH¢ {Number(item.amount).toFixed(2)}
                  </Text>
                  <Text style={styles.historyDate}>
                    {new Date(item.paid_at ?? item.created_at).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              </View>
            </Card>
          ))
      )}
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
    marginBottom: 24,
  },
  title: {
    fontSize: 34,
    color: "#111827",
    fontFamily: "Inter_700Bold",
    marginLeft: 8,
  },
  subtitle: {
    color: "#6B7280",
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    marginTop: -18,
    marginBottom: 28,
  },
  balanceCard: {
    backgroundColor: "#C44736",
    borderRadius: 18,
    padding: 22,
    marginBottom: 24,
  },
  balanceHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  balanceIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 18,
  },
  balanceLabel: {
    color: "#FDECEC",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  currencyLabel: {
    color: "#FDECEC",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    marginTop: 6,
  },
  balanceAmount: {
    color: "#FFFFFF",
    fontSize: 34,
    fontFamily: "Inter_700Bold",
    marginTop: 8,
  },
  balanceSubText: {
    color: "#FDECEC",
    marginTop: 12,
    fontFamily: "Inter_400Regular",
  },
  sectionLabel: {
    color: "#C44736",
    fontSize: 11,
    marginBottom: 10,
    fontFamily: "Inter_600SemiBold",
  },
  methodContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  methodButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
  },
  selectedMethod: {
    borderWidth: 1.5,
    borderColor: "#C44736",
    backgroundColor: "#FFF5F3",
  },
  selectedMethodText: {
    color: "#C44736",
    marginLeft: 6,
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  methodText: {
    color: "#6B7280",
    marginLeft: 6,
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  numberCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#ECECEC",
    borderRadius: 14,
    padding: 18,
    marginBottom: 24,
  },
  numberLabel: {
    color: "#C44736",
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },
  numberText: {
    color: "#111827",
    marginTop: 8,
    fontFamily: "Inter_500Medium",
  },
  payButton: {
    backgroundColor: "#C44736",
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: "center",
    marginBottom: 30,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 5,
  },
  payButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  historyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ECECEC",
  },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#34A853",
    marginRight: 10,
    marginTop: 6,
  },
  historyTitle: {
    color: "#111827",
    fontFamily: "Inter_600SemiBold",
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
    fontFamily: "Inter_600SemiBold",
  },
  historyDate: {
    color: "#6B7280",
    fontSize: 11,
    marginTop: 3,
  },
  emptyStateCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ECECEC",
  },
  emptyStateTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#111827",
    marginBottom: 4,
  },
  emptyStateSubtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    textAlign: "center",
  },
});
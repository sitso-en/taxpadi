import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useTransactions } from "../../context/TransactionContext";
import { usePayments } from "../../context/PaymentContext";

export default function TaxScreen() {
  const [activeTab, setActiveTab] =
    useState("Overview");

  const { transactions } =
    useTransactions();

  const { payments } = usePayments();

  // Financial calculations

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const deductibleExpenses =
    transactions
      .filter(
        (t) =>
          t.type === "expense" &&
          t.isDeductible
      )
      .reduce(
        (sum, t) => sum + t.amount,
        0
      );

  // Tax calculations

  const vatDue = totalIncome * 0.15;

  const payeDue = totalIncome * 0.055;

  const taxableProfit =
    totalIncome - deductibleExpenses;

  const incomeTax =
    taxableProfit > 0
      ? taxableProfit * 0.25
      : 0;

  const withholdingTax =
    totalIncome * 0.05;

  const totalTaxLiability =
    vatDue +
    payeDue +
    incomeTax +
    withholdingTax;

  const totalPayments =
    payments.reduce(
      (sum, payment) =>
        sum + payment.amount,
      0
    );

  const netTaxLiability =
    totalTaxLiability -
    totalPayments;

  const totalTaxDue = Math.max(
    netTaxLiability,
    0
  );

  // Progress percentages

  const maxTax =
    totalTaxLiability || 1;

  const vatPercent =
    (vatDue / maxTax) * 100;

  const payePercent =
    (payeDue / maxTax) * 100;

  const incomeTaxPercent =
    (incomeTax / maxTax) * 100;

  const withholdingPercent =
    (withholdingTax / maxTax) * 100;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingBottom: 120,
      }}
      showsVerticalScrollIndicator={
        false
      }
    >
      {/* Header */}

      <Text style={styles.title}>
        Taxes
      </Text>

      {/* Main Tax Card */}

      <View style={styles.taxCard}>
        <View style={styles.taxCircle}>
          <View
            style={styles.taxCircleInner}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.taxLabel}>
  TOTAL TAX DUE
</Text>

<Text style={styles.taxAmount}>
  GH¢ {totalTaxDue.toFixed(2)}
</Text>

          <Text style={styles.taxSubText}>
  Total taxes currently payable
</Text>
        </View>
      </View>

      {/* Tabs */}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={
          false
        }
        style={styles.tabsContainer}
      >
        {[
          "Overview",
          "VAT",
          "PAYE",
          "Withholding",
        ].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              activeTab === tab &&
                styles.activeTabButton,
            ]}
            onPress={() =>
              setActiveTab(tab)
            }
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab &&
                  styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>
        Tax Breakdown
      </Text>

      <View style={styles.breakdownCard}>
        {activeTab === "Overview" && (
          <>
            <View style={styles.taxItem}>
              <View
                style={styles.breakdownRow}
              >
                <Text
                  style={
                    styles.breakdownLabel
                  }
                >
                  VAT Due
                </Text>

                <Text
                  style={
                    styles.breakdownAmount
                  }
                >
                  GH¢ {vatDue.toFixed(2)}
                </Text>
              </View>

              <View
                style={
                  styles.progressBackground
                }
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(
                        vatPercent,
                        100
                      )}%`,
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.taxItem}>
              <View
                style={styles.breakdownRow}
              >
                <Text
                  style={
                    styles.breakdownLabel
                  }
                >
                  PAYE Due
                </Text>

                <Text
                  style={
                    styles.breakdownAmount
                  }
                >
                  GH¢ {payeDue.toFixed(2)}
                </Text>
              </View>

              <View
                style={
                  styles.progressBackground
                }
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(
                        payePercent,
                        100
                      )}%`,
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.taxItem}>
              <View
                style={styles.breakdownRow}
              >
                <Text
                  style={
                    styles.breakdownLabel
                  }
                >
                  Income Tax
                </Text>

                <Text
                  style={
                    styles.breakdownAmount
                  }
                >
                  GH¢{" "}
                  {incomeTax.toFixed(2)}
                </Text>
              </View>

              <View
                style={
                  styles.progressBackground
                }
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(
                        incomeTaxPercent,
                        100
                      )}%`,
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.taxItem}>
              <View
                style={styles.breakdownRow}
              >
                <Text
                  style={
                    styles.breakdownLabel
                  }
                >
                  Withholding Tax
                </Text>

                <Text
                  style={
                    styles.breakdownAmount
                  }
                >
                  GH¢{" "}
                  {withholdingTax.toFixed(
                    2
                  )}
                </Text>
              </View>

              <View
                style={
                  styles.progressBackground
                }
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(
                        withholdingPercent,
                        100
                      )}%`,
                    },
                  ]}
                />
              </View>
            </View>

            <View
              style={styles.summaryCard}
            >
              <View
                style={styles.breakdownRow}
              >
                <Text
                  style={styles.totalLabel}
                >
                  Total Tax Liability
                </Text>

                <Text
                  style={
                    styles.totalAmount
                  }
                >
                  GH¢{" "}
                  {totalTaxLiability.toFixed(
                    2
                  )}
                </Text>
              </View>

             <View style={styles.breakdownRow}>
  <Text style={styles.totalLabel}>
    Net Tax Liability
  </Text>

  <Text style={styles.totalAmount}>
    GH¢ {Math.max(netTaxLiability, 0).toFixed(2)}
  </Text>
</View>
            </View>
          </>
        )}

        {activeTab === "VAT" && (
          <>
            <Text style={styles.totalLabel}>
              VAT Due
            </Text>

            <Text style={styles.taxValue}>
              GH¢ {vatDue.toFixed(2)}
            </Text>

            <Text
              style={styles.infoText}
            >
              VAT is charged at 15% of
              total income.
            </Text>
          </>
        )}

        {activeTab === "PAYE" && (
          <>
            <Text style={styles.totalLabel}>
              PAYE Due
            </Text>

            <Text style={styles.taxValue}>
              GH¢ {payeDue.toFixed(2)}
            </Text>

            <Text
              style={styles.infoText}
            >
              PAYE is calculated at
              5.5% of income.
            </Text>
          </>
        )}

        {activeTab ===
          "Withholding" && (
          <>
            <Text style={styles.totalLabel}>
              Withholding Tax
            </Text>

            <Text style={styles.taxValue}>
              GH¢{" "}
              {withholdingTax.toFixed(
                2
              )}
            </Text>

            <Text
              style={styles.infoText}
            >
              Estimated at 5% of total
              income.
            </Text>

            <View
              style={{ marginTop: 20 }}
            >
              <Text
                style={
                  styles.breakdownLabel
                }
              >
                Deductible Expenses
              </Text>

              <Text
                style={
                  styles.breakdownAmount
                }
              >
                GH¢{" "}
                {deductibleExpenses.toFixed(
                  2
                )}
              </Text>
            </View>
          </>
        )}
      </View>

      {totalIncome >= 200000 && (
        <View style={styles.warningCard}>
          <Ionicons
            name="alert-circle-outline"
            size={24}
            color="#C44736"
          />

          <View
            style={{
              flex: 1,
              marginLeft: 12,
            }}
          >
            <Text
              style={styles.warningTitle}
            >
              VAT Threshold Reached
            </Text>

            <Text
              style={styles.warningText}
            >
              Your business has
              exceeded the VAT
              registration threshold.
            </Text>
          </View>
        </View>
      )}

      {netTaxLiability > 0 && (
        <View style={styles.warningCard}>
          <Ionicons
            name="warning-outline"
            size={24}
            color="#C44736"
          />

          <View
            style={{
              flex: 1,
              marginLeft: 12,
            }}
          >
            <Text
              style={styles.warningTitle}
            >
              Outstanding Tax
            </Text>

            <Text
              style={styles.warningText}
            >
              You still owe GH¢{" "}
              {netTaxLiability.toFixed(
                2
              )}
              .
            </Text>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          router.push("/tax-returns")
        }
      >
        <Text
          style={styles.buttonText}
        >
          File Tax Return
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 20,
    paddingTop: 55,
  },

  title: {
    fontSize: 32,
    color: "#111827",
    fontFamily:
      "Inter_700Bold",
    marginBottom: 24,
  },

  taxCard: {
    backgroundColor: "#C44736",
    borderRadius: 24,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },

  taxCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 18,
  },

  taxCircleInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
  },

  taxLabel: {
    color: "#FDECEC",
    fontSize: 12,
    fontFamily:
      "Inter_600SemiBold",
  },

  taxAmount: {
    color: "#FFFFFF",
    fontSize: 32,
    fontFamily:
      "Inter_700Bold",
    marginTop: 6,
  },

  taxSubText: {
    color: "#FDECEC",
    marginTop: 6,
    fontFamily:
      "Inter_400Regular",
  },

  tabsContainer: {
    marginBottom: 24,
  },

  tabButton: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },

  activeTabButton: {
    backgroundColor: "#C44736",
  },

  tabText: {
    color: "#111827",
    fontFamily:
      "Inter_500Medium",
  },

  activeTabText: {
    color: "#FFFFFF",
  },

  sectionTitle: {
    fontSize: 20,
    color: "#111827",
    fontFamily:
      "Inter_700Bold",
    marginBottom: 16,
  },

  breakdownCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
  },

  taxItem: {
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  breakdownRow: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    marginBottom: 12,
  },

  breakdownLabel: {
    color: "#111827",
    fontFamily:
      "Inter_500Medium",
  },

  breakdownAmount: {
    color: "#111827",
    fontFamily:
      "Inter_700Bold",
  },

  progressBackground: {
    height: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
  },

  progressFill: {
    height: 8,
    backgroundColor: "#C44736",
    borderRadius: 20,
  },

  summaryCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    marginTop: 10,
  },

  totalLabel: {
    fontSize: 18,
    color: "#111827",
    fontFamily:
      "Inter_700Bold",
  },

  totalAmount: {
    color: "#111827",
    fontSize: 22,
    fontFamily:
      "Inter_700Bold",
  },

  taxValue: {
    fontSize: 32,
    color: "#111827",
    fontFamily:
      "Inter_700Bold",
    marginBottom: 12,
  },

  infoText: {
    color: "#6B7280",
    fontFamily:
      "Inter_400Regular",
    lineHeight: 22,
  },

  warningCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },

  warningTitle: {
    color: "#111827",
    fontFamily:
      "Inter_600SemiBold",
  },

  warningText: {
    color: "#6B7280",
    marginTop: 4,
    fontFamily:
      "Inter_400Regular",
  },

  button: {
    backgroundColor: "#C44736",
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily:
      "Inter_600SemiBold",
  },
});
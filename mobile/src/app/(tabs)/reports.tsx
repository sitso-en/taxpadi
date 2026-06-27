import React from "react";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import Papa from "papaparse";

import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useTransactions } from "../../context/TransactionContext";
import { usePayments } from "../../context/PaymentContext";
import { useInvoices } from "../../context/InvoiceContext";
import { useTaxReturns } from "../../context/TaxReturnsContext";
import { useUser } from "../../context/UserContext";

export default function ReportsScreen() {
  const { transactions } =
    useTransactions();

  const { payments } =
    usePayments();

  const { invoices } =
    useInvoices();

  const { previousReturns } =
    useTaxReturns();

  const { user } = useUser();

  // Dynamic calculations

  const totalIncome =
    transactions
      .filter(
        (transaction) =>
          transaction.type ===
          "income"
      )
      .reduce(
        (sum, transaction) =>
          sum + transaction.amount,
        0
      );

  const totalExpenses =
    transactions
      .filter(
        (transaction) =>
          transaction.type ===
          "expense"
      )
      .reduce(
        (sum, transaction) =>
          sum + transaction.amount,
        0
      );

  const netProfit =
    totalIncome - totalExpenses;

  const estimatedTax =
    Math.max(netProfit, 0) * 0.1;

  const totalPayments =
    payments.reduce(
      (sum, payment) =>
        sum + payment.amount,
      0
    );

  const totalInvoices =
    invoices.reduce(
      (sum, invoice) =>
        sum + invoice.amount,
      0
    );

  const reports = [
    {
      id: 1,
      icon: "calendar-outline",
      title:
        "Annual Tax Summary",
      subtitle:
        "Full year income, expenses & liability",
    },

    {
      id: 2,
      icon: "trending-up-outline",
      title:
        "Income Statement",
      subtitle:
        "Revenue, expenses, profit & loss",
    },

    {
      id: 3,
      icon: "receipt-outline",
      title: "VAT Report",
      subtitle:
        "VAT liabilities and payments",
    },

    {
      id: 4,
      icon: "person-outline",
      title: "PAYE Report",
      subtitle:
        "Employee payroll tax summary",
    },

    {
      id: 5,
      icon: "bar-chart-outline",
      title:
        "Transaction History",
      subtitle:
        "All logged transactions",
    },
  ];

  // PDF Export

  const generatePDF =
    async (
      reportTitle: string
    ) => {
      try {
        const html = `
          <html>
            <body style="font-family: Arial; padding: 20px;">
              <h1>${reportTitle}</h1>

              <h2>${user.fullName}</h2>

              <p>
                Generated:
                ${new Date().toLocaleString()}
              </p>

              <hr/>

              <p><strong>Total Income:</strong>
                GH¢ ${totalIncome.toFixed(
                  2
                )}
              </p>

              <p><strong>Total Expenses:</strong>
                GH¢ ${totalExpenses.toFixed(
                  2
                )}
              </p>

              <p><strong>Net Profit:</strong>
                GH¢ ${netProfit.toFixed(
                  2
                )}
              </p>

              <p><strong>Estimated Tax:</strong>
                GH¢ ${estimatedTax.toFixed(
                  2
                )}
              </p>

              <p><strong>Total Payments:</strong>
                GH¢ ${totalPayments.toFixed(
                  2
                )}
              </p>

              <p><strong>Total Invoices:</strong>
                GH¢ ${totalInvoices.toFixed(
                  2
                )}
              </p>

              <p><strong>Filed Returns:</strong>
                ${
                  previousReturns.length
                }
              </p>
            </body>
          </html>
        `;

        const { uri } =
          await Print.printToFileAsync(
            {
              html,
            }
          );

        if (
          await Sharing.isAvailableAsync()
        ) {
          await Sharing.shareAsync(
            uri
          );
        }
      } catch (error) {
        Alert.alert(
          "Error",
          "Failed to generate PDF."
        );
      }
    };

  // CSV Export

  const generateCSV = async (
  reportTitle: string
) => {
  try {
    const csv = Papa.unparse([
      {
        Report: reportTitle,
        User: user.fullName,
        Generated:
          new Date().toLocaleString(),
        Income: totalIncome,
        Expenses: totalExpenses,
        NetProfit: netProfit,
        Tax: estimatedTax,
        Payments: totalPayments,
        Invoices: totalInvoices,
        FiledReturns:
          previousReturns.length,
      },
    ]);

    console.log("CSV DATA:", csv);

    const fileUri =
  new FileSystem.File(
    FileSystem.Paths.cache,
    `${reportTitle}.csv`
  );

    console.log(
      "Saving CSV to:",
      fileUri
    );

   await fileUri.write(csv);

    const available =
      await Sharing.isAvailableAsync();

    console.log(
      "Sharing available:",
      available
    );

    if (available) {
      await Sharing.shareAsync(
  fileUri.uri
);
    } else {
      Alert.alert(
        "Sharing not available"
      );
    }
  } catch (error) {
    console.log(
      "CSV ERROR:",
      error
    );

    Alert.alert(
      "CSV Error",
      String(error)
    );
  }
};
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
          Reports & Export
        </Text>
      </View>

      <Text
        style={styles.subtitle}
      >
        Generate detailed
        reports for your
        records or GRA.
      </Text>

      {reports.map(
        (report) => (
          <View
            key={report.id}
            style={styles.card}
          >
            <View
              style={styles.topRow}
            >
              <Ionicons
                name={
                  report.icon as any
                }
                size={22}
                color="#6B7280"
              />

              <View
                style={
                  styles.textContainer
                }
              >
                <Text
                  style={
                    styles.cardTitle
                  }
                >
                  {report.title}
                </Text>

                <Text
                  style={
                    styles.cardSubtitle
                  }
                >
                  {
                    report.subtitle
                  }
                </Text>
              </View>
            </View>

            <View
              style={
                styles.buttonRow
              }
            >
              <TouchableOpacity
                style={
                  styles.pdfButton
                }
                onPress={() =>
                  generatePDF(
                    report.title
                  )
                }
              >
                <Text
                  style={
                    styles.pdfText
                  }
                >
                  PDF
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={
                  styles.csvButton
                }
                onPress={() =>
                  generateCSV(
                    report.title
                  )
                }
              >
                <Text
                  style={
                    styles.csvText
                  }
                >
                  CSV
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )
      )}
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
      marginBottom: 8,
    },

    title: {
      fontSize: 28,
      color: "#111827",
      fontFamily:
        "Inter_700Bold",
      marginLeft: 8,
    },

    subtitle: {
      color: "#6B7280",
      marginBottom: 24,
      fontFamily:
        "Inter_400Regular",
    },

    card: {
      backgroundColor:
        "#FFFFFF",
      borderRadius: 16,
      padding: 18,
      marginBottom: 14,
    },

    topRow: {
      flexDirection: "row",
      alignItems: "flex-start",
    },

    textContainer: {
      flex: 1,
      marginLeft: 12,
    },

    cardTitle: {
      color: "#111827",
      fontSize: 16,
      fontFamily:
        "Inter_600SemiBold",
    },

    cardSubtitle: {
      color: "#6B7280",
      fontSize: 12,
      marginTop: 4,
      fontFamily:
        "Inter_400Regular",
    },

    buttonRow: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      marginTop: 16,
    },

    pdfButton: {
      flex: 1,
      backgroundColor:
        "#FCE8E6",
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: "center",
      marginRight: 8,
    },

    csvButton: {
      flex: 1,
      backgroundColor:
        "#F3F4F6",
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: "center",
      marginLeft: 8,
    },

    pdfText: {
      color: "#C44736",
      fontFamily:
        "Inter_600SemiBold",
    },

    csvText: {
      color: "#111827",
      fontFamily:
        "Inter_600SemiBold",
    },
  });
import React, { useState } from "react";
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
  const { transactions } = useTransactions();
  const { payments } = usePayments();
  const { invoices } = useInvoices();
  const { previousReturns } = useTaxReturns();
  const { user } = useUser();

  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);

  // Dynamic calculations
  const totalIncome = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const totalExpenses = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const netProfit = totalIncome - totalExpenses;
  const estimatedTax = Math.max(netProfit, 0) * 0.1;

  const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalInvoices = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);

  const reports = [
    {
      id: 1,
      icon: "calendar-outline",
      title: "Annual Tax Summary",
      subtitle: "Full year income, expenses & liability",
    },
    {
      id: 2,
      icon: "trending-up-outline",
      title: "Income Statement",
      subtitle: "Revenue, expenses, profit & loss",
    },
    {
      id: 3,
      icon: "receipt-outline",
      title: "VAT Report",
      subtitle: "VAT liabilities and payments",
    },
    {
      id: 4,
      icon: "person-outline",
      title: "PAYE Report",
      subtitle: "Employee payroll tax summary",
    },
    {
      id: 5,
      icon: "bar-chart-outline",
      title: "Transaction History",
      subtitle: "All logged transactions",
    },
  ];

  // PDF Export
  const generatePDF = async (reportTitle: string) => {
    if (exportingPdf) return;

    setExportingPdf(true);

    try {
      const html = `
        <html>
          <body style="font-family: Arial; padding: 20px;">
            <h1>${reportTitle}</h1>
            <h2>${user?.label}</h2>
            <p>Generated: ${new Date().toLocaleString()}</p>
            <hr/>
            <p><strong>Total Income:</strong> GH¢ ${totalIncome.toFixed(2)}</p>
            <p><strong>Total Expenses:</strong> GH¢ ${totalExpenses.toFixed(2)}</p>
            <p><strong>Net Profit:</strong> GH¢ ${netProfit.toFixed(2)}</p>
            <p><strong>Estimated Tax:</strong> GH¢ ${estimatedTax.toFixed(2)}</p>
            <p><strong>Total Payments:</strong> GH¢ ${totalPayments.toFixed(2)}</p>
            <p><strong>Total Invoices:</strong> GH¢ ${totalInvoices.toFixed(2)}</p>
            <p><strong>Filed Returns:</strong> ${previousReturns.length}</p>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
        Alert.alert(
          "Success",
          `${reportTitle} PDF generated successfully.`
        );
      }
    } catch (error: any) {
      Alert.alert(
        "Export Failed",
        error?.response?.data?.message ??
          "Unable to export PDF."
      );
    } finally {
      setExportingPdf(false);
    }
  };

  // CSV Export
  const generateCSV = async (reportTitle: string) => {
    if (exportingCsv) return;

    setExportingCsv(true);

    try {
      const csv = Papa.unparse([
        {
          Report: reportTitle,
          User: user?.label,
          Generated: new Date().toLocaleString(),
          Income: totalIncome,
          Expenses: totalExpenses,
          NetProfit: netProfit,
          Tax: estimatedTax,
          Payments: totalPayments,
          Invoices: totalInvoices,
          FiledReturns: previousReturns.length,
        },
      ]);

      console.log("CSV DATA:", csv);

      const file = new FileSystem.File(
        FileSystem.Paths.document,
        `${reportTitle.replace(/\s+/g, "_")}.csv`
      );

      console.log("Saving CSV to:", file.uri);
      await file.write(csv);

      const available = await Sharing.isAvailableAsync();
      console.log("Sharing available:", available);

      if (available) {
        await Sharing.shareAsync(file.uri);
        Alert.alert(
          "Success",
          `${reportTitle} CSV generated successfully.`
        );
      } else {
        Alert.alert("Sharing not available");
      }
    } catch (error: any) {
      console.log("CSV ERROR:", error);
      Alert.alert(
        "Export Failed",
        error?.response?.data?.message ??
          "Unable to export CSV."
      );
    } finally {
      setExportingCsv(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingBottom: 120,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color="#111827" />
        </TouchableOpacity>

        <Text style={styles.title}>Reports & Export</Text>
      </View>

      <Text style={styles.subtitle}>
        Generate detailed reports for your records or GRA.
      </Text>

      {/* Business Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryIcon}>
          <Ionicons
            name="analytics-outline"
            size={28}
            color="#FFFFFF"
          />
        </View>

        <View>
          <Text style={styles.summaryTitle}>
            Business Summary
          </Text>

          <Text style={styles.summarySubtitle}>
            Income GH¢ {totalIncome.toFixed(2)}
          </Text>

          <Text style={styles.summarySubtitle}>
            Profit GH¢ {netProfit.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Reports List */}
      {reports.map((report) => (
        <View key={report.id} style={styles.card}>
          <View style={styles.topRow}>
            <View style={styles.iconCircle}>
              <Ionicons name={report.icon as any} size={22} color="#C44736" />
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.cardTitle}>{report.title}</Text>
              <Text style={styles.cardSubtitle}>{report.subtitle}</Text>
              <Text style={styles.generatedText}>
                Updated {new Date().toLocaleDateString()}
              </Text>
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.pdfButton}
              onPress={() => generatePDF(report.title)}
              disabled={exportingPdf}
            >
              <Ionicons
                name="document-text-outline"
                size={18}
                color="#FFFFFF"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.pdfText}>
                {exportingPdf ? "Exporting..." : "Export PDF"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.csvButton}
              onPress={() => generateCSV(report.title)}
              disabled={exportingCsv}
            >
              <Ionicons
                name="download-outline"
                size={18}
                color="#111827"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.csvText}>
                {exportingCsv ? "Exporting..." : "Export CSV"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
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
    marginBottom: 8,
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
    marginTop: -6,
    marginBottom: 28,
    fontFamily: "Inter_400Regular",
  },

  summaryCard: {
    backgroundColor: "#C44736",
    borderRadius: 18,
    padding: 22,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
  },

  summaryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },

  summaryTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },

  summarySubtitle: {
    color: "#FDECEC",
    marginTop: 3,
    fontFamily: "Inter_400Regular",
  },

  card: {
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

  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#FCE8E6",
    justifyContent: "center",
    alignItems: "center",
  },

  textContainer: {
    flex: 1,
    marginLeft: 12,
  },

  cardTitle: {
    color: "#111827",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },

  cardSubtitle: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 4,
    fontFamily: "Inter_400Regular",
  },

  generatedText: {
    color: "#9CA3AF",
    fontSize: 11,
    marginTop: 6,
    fontFamily: "Inter_400Regular",
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },

  pdfButton: {
    flex: 1,
    backgroundColor: "#C44736",
    paddingVertical: 14,
    borderRadius: 12,
    marginRight: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  csvButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    borderRadius: 12,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  pdfText: {
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
  },

  csvText: {
    color: "#111827",
    fontFamily: "Inter_600SemiBold",
  },
});
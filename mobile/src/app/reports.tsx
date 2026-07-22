import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import SubscriptionGate from "@/components/SubscriptionGate";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

import BottomSheet from "@/components/BottomSheet";
import {
  exportReport,
  getExportStatus,
  getIncomeStatement,
  getTaxHistory,
} from "@/services/reports.service";
import { getUserFriendlyError } from "@/utils/error";
import { useToast } from "@/context/ToastContext";

const fmt = (n: number) =>
  `GH¢ ${Number(n ?? 0).toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const TAX_TYPE_LABELS: Record<string, string> = {
  income_tax: "Income Tax",
  vat: "VAT",
  paye: "PAYE",
  withholding: "Withholding Tax",
  corporate_tax: "Corporate Tax",
};

const REPORT_TYPES = [
  {
    id: "annual",
    icon: "calendar-outline",
    title: "Annual Tax Summary",
    subtitle: "Full year income, expenses & liability",
    exportType: "annual",
  },
  {
    id: "income",
    icon: "trending-up-outline",
    title: "Income Statement",
    subtitle: "Revenue, expenses, profit & loss",
    exportType: "income_statement",
  },
  {
    id: "vat",
    icon: "receipt-outline",
    title: "VAT Report",
    subtitle: "VAT liabilities and payments",
    exportType: "vat",
  },
  {
    id: "paye",
    icon: "person-outline",
    title: "PAYE Report",
    subtitle: "Employee payroll tax summary",
    exportType: "paye",
  },
];

export default function ReportsScreen() {
  const { showToast } = useToast();
  const [exporting, setExporting] = useState<string | null>(null);

  const [showIncomeStatement, setShowIncomeStatement] = useState(false);
  const [incomeData, setIncomeData] = useState<any>(null);
  const [incomeLoading, setIncomeLoading] = useState(false);
  const [incomeYear, setIncomeYear] = useState(new Date().getFullYear());

  const [showTaxHistory, setShowTaxHistory] = useState(false);
  const [taxHistoryData, setTaxHistoryData] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchIncomeStatement = async (year: number) => {
    setIncomeLoading(true);
    setIncomeData(null);
    try {
      const res = await getIncomeStatement({ year });
      setIncomeData(res.data ?? res);
    } catch (error: any) {
      showToast(getUserFriendlyError(error), "error");
    } finally {
      setIncomeLoading(false);
    }
  };

  const fetchTaxHistory = async () => {
    setHistoryLoading(true);
    setTaxHistoryData([]);
    try {
      const res = await getTaxHistory();
      setTaxHistoryData(res.data?.history ?? res.data ?? []);
    } catch (error: any) {
      showToast(getUserFriendlyError(error), "error");
    } finally {
      setHistoryLoading(false);
    }
  };

  const shareFileFromUrl = async (fileUrl: string, format: "pdf" | "excel") => {
    const ext = format === "pdf" ? "pdf" : "xlsx";
    const mimeType =
      format === "pdf"
        ? "application/pdf"
        : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    const localUri = `${FileSystem.cacheDirectory}taxpadi_report_${Date.now()}.${ext}`;
    const { uri } = await FileSystem.downloadAsync(fileUrl, localUri);
    await Sharing.shareAsync(uri, { mimeType, dialogTitle: "Share Report" });
  };

  const shareFileFromBase64 = async (b64: string, fileName: string, format: "pdf" | "excel") => {
    const mimeType =
      format === "pdf"
        ? "application/pdf"
        : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    const localUri = `${FileSystem.cacheDirectory}${fileName}`;
    await FileSystem.writeAsStringAsync(localUri, b64, { encoding: FileSystem.EncodingType.Base64 });
    await Sharing.shareAsync(localUri, { mimeType, dialogTitle: "Share Report" });
  };

  const handleExport = async (format: "pdf" | "excel", reportType: string) => {
    const key = `${reportType}-${format}`;
    if (exporting) return;
    setExporting(key);
    try {
      const res = await exportReport(format, reportType);

      // Synchronous path: file_url returned immediately
      const directUrl: string | undefined = res.data?.file_url;
      if (directUrl) {
        await shareFileFromUrl(directUrl, format);
        return;
      }

      // Async path: backend returns export_id and status "processing"
      const exportId: string | undefined = res.data?.export_id;
      if (!exportId) {
        showToast("Could not start export. Please try again.", "error");
        return;
      }

      // Poll every 2s, up to 30 attempts (60 seconds)
      for (let i = 0; i < 30; i++) {
        await new Promise<void>((resolve) => setTimeout(resolve, 2000));
        const statusRes = await getExportStatus(exportId);
        const jobStatus: string = statusRes.data?.status;

        if (jobStatus === "done") {
          const fileData: string | undefined = statusRes.data?.file_data;
          const fileName: string = statusRes.data?.file_name ?? `taxpadi-report.${format === "pdf" ? "pdf" : "xlsx"}`;
          const fileUrl: string | undefined = statusRes.data?.file_url ?? statusRes.data?.fileUrl;

          if (fileData) {
            await shareFileFromBase64(fileData, fileName, format);
          } else if (fileUrl) {
            await shareFileFromUrl(fileUrl, format);
          } else {
            showToast("File not found in response.", "error");
          }
          return;
        }

        if (jobStatus === "failed") {
          showToast(statusRes.data?.error ?? "Export generation failed.", "error");
          return;
        }
      }

      showToast("Report generation is taking longer than expected. Please try again later.", "info");
    } catch (error: any) {
      showToast(getUserFriendlyError(error), "error");
    } finally {
      setExporting(null);
    }
  };

  return (
    <SubscriptionGate
      feature="Reports & Export"
      description="Generate and export your annual tax summary, income statement, VAT and PAYE reports as PDF or Excel."
      icon="bar-chart-outline"
    >
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 48 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Reports & Export</Text>
      </View>

      <Text style={styles.subtitle}>
        Generate detailed reports for your records or GRA.
      </Text>

      {/* Report Cards */}
      {REPORT_TYPES.map((report) => (
        <View key={report.id} style={styles.card}>
          <View style={styles.topRow}>
            <View style={styles.iconCircle}>
              <Ionicons name={report.icon as any} size={18} color="#C44736" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.cardTitle}>{report.title}</Text>
              <Text style={styles.cardSubtitle}>{report.subtitle}</Text>
            </View>
            {report.id === "income" && (
              <TouchableOpacity
                onPress={() => { setShowIncomeStatement(true); fetchIncomeStatement(incomeYear); }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.viewLink}>View</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.pdfButton, exporting === `${report.exportType}-pdf` && { opacity: 0.7 }]}
              onPress={() => handleExport("pdf", report.exportType)}
              disabled={!!exporting}
            >
              <Ionicons name="share-outline" size={18} color="#FFFFFF" style={{ marginRight: 5 }} />
              <Text style={styles.pdfText}>
                {exporting === `${report.exportType}-pdf` ? "Exporting…" : "Share PDF"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.csvButton, exporting === `${report.exportType}-excel` && { opacity: 0.7 }]}
              onPress={() => handleExport("excel", report.exportType)}
              disabled={!!exporting}
            >
              <Ionicons name="share-outline" size={18} color="#111827" style={{ marginRight: 5 }} />
              <Text style={styles.csvText}>
                {exporting === `${report.exportType}-excel` ? "Exporting…" : "Share Excel"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* Tax History card */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => { setShowTaxHistory(true); fetchTaxHistory(); }}
        activeOpacity={0.85}
      >
        <View style={styles.topRow}>
          <View style={styles.iconCircle}>
            <Ionicons name="time-outline" size={18} color="#C44736" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.cardTitle}>Tax History</Text>
            <Text style={styles.cardSubtitle}>Past filings and payment history</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </View>
      </TouchableOpacity>
    </ScrollView>

    {/* Income Statement Sheet */}
    <BottomSheet visible={showIncomeStatement} onClose={() => setShowIncomeStatement(false)}>
      <View style={styles.sheetContent}>
        <Text style={styles.sheetTitle}>Income Statement</Text>

        {/* Year picker */}
        <View style={styles.yearPicker}>
          <TouchableOpacity
            onPress={() => { const y = incomeYear - 1; setIncomeYear(y); fetchIncomeStatement(y); }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-back" size={20} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.yearText}>{incomeYear}</Text>
          <TouchableOpacity
            onPress={() => {
              if (incomeYear >= new Date().getFullYear()) return;
              const y = incomeYear + 1; setIncomeYear(y); fetchIncomeStatement(y);
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-forward" size={20} color={incomeYear >= new Date().getFullYear() ? "#D1D5DB" : "#374151"} />
          </TouchableOpacity>
        </View>

        {incomeLoading ? (
          <ActivityIndicator color="#C44736" style={{ marginVertical: 32 }} />
        ) : !incomeData ? (
          <Text style={styles.sheetEmpty}>No data available for {incomeYear}.</Text>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
            {(() => {
              const monthly: any[] = incomeData.monthly_summary ?? [];
              const totalIncome = monthly.reduce((s: number, m: any) => s + Number(m.total_income ?? 0), 0);
              const totalExpenses = monthly.reduce((s: number, m: any) => s + Number(m.total_expenses ?? 0), 0);
              const netProfit = monthly.reduce((s: number, m: any) => s + Number(m.net_profit ?? 0), 0);
              return (
                <>
                  {/* Summary totals */}
                  <View style={styles.stmtCard}>
                    <View style={styles.stmtRow}>
                      <Text style={styles.stmtLabel}>Total Income</Text>
                      <Text style={[styles.stmtVal, { color: "#16A34A" }]}>{fmt(totalIncome)}</Text>
                    </View>
                    <View style={styles.stmtRow}>
                      <Text style={styles.stmtLabel}>Total Expenses</Text>
                      <Text style={[styles.stmtVal, { color: "#C44736" }]}>{fmt(totalExpenses)}</Text>
                    </View>
                    <View style={[styles.stmtRow, styles.stmtDivider]}>
                      <Text style={[styles.stmtLabel, { fontFamily: "Inter_700Bold", color: "#111827" }]}>Net Profit</Text>
                      <Text style={[styles.stmtVal, { fontFamily: "Inter_700Bold", color: "#111827" }]}>{fmt(netProfit)}</Text>
                    </View>
                  </View>

                  {/* Monthly breakdown */}
                  {monthly.length > 0 && (
                    <>
                      <Text style={styles.breakdownTitle}>Monthly Breakdown</Text>
                      {monthly.map((m: any, i: number) => (
                        <View key={i} style={styles.breakdownRow}>
                          <Text style={styles.breakdownLabel}>{m.month}</Text>
                          <Text style={[styles.breakdownVal, { color: Number(m.net_profit ?? 0) >= 0 ? "#16A34A" : "#C44736" }]}>
                            {fmt(m.net_profit ?? 0)}
                          </Text>
                        </View>
                      ))}
                    </>
                  )}
                  <View style={{ height: 20 }} />
                </>
              );
            })()}
          </ScrollView>
        )}
      </View>
    </BottomSheet>

    {/* Tax History Sheet */}
    <BottomSheet visible={showTaxHistory} onClose={() => setShowTaxHistory(false)}>
      <View style={styles.sheetContent}>
        <Text style={styles.sheetTitle}>Tax History</Text>
        {historyLoading ? (
          <ActivityIndicator color="#C44736" style={{ marginVertical: 32 }} />
        ) : taxHistoryData.length === 0 ? (
          <Text style={styles.sheetEmpty}>No tax history found.</Text>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
            {taxHistoryData.map((item: any, i: number) => (
              <View key={i} style={styles.historyRow}>
                <View style={styles.historyIconBox}>
                  <Ionicons name="document-text-outline" size={16} color="#C44736" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.historyRowTitle}>
                    {TAX_TYPE_LABELS[item.tax_type] ?? item.tax_type} · {item.year ?? item.tax_year}
                  </Text>
                  <Text style={styles.historyRowSub}>
                    {item.status === "submitted" ? "Submitted" : item.status}
                    {item.submitted_at ? ` · ${new Date(item.submitted_at).toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" })}` : ""}
                  </Text>
                </View>
                <Text style={styles.historyRowAmount}>{fmt(item.amount_paid ?? item.tax_liability ?? 0)}</Text>
              </View>
            ))}
            <View style={{ height: 20 }} />
          </ScrollView>
        )}
      </View>
    </BottomSheet>
    </SubscriptionGate>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2EDE8",
    paddingHorizontal: 16,
    paddingTop: 44,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  title: {
    fontSize: 24,
    color: "#111827",
    fontFamily: "Inter_700Bold",
    marginLeft: 10,
  },

  subtitle: {
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 20,
    fontFamily: "Inter_400Regular",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EFEFED",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },

  cardSubtitle: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 2,
    fontFamily: "Inter_400Regular",
  },

  buttonRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },

  pdfButton: {
    flex: 1,
    backgroundColor: "#C44736",
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  csvButton: {
    flex: 1,
    backgroundColor: "#F9F9F9",
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  pdfText: {
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },

  csvText: {
    color: "#111827",
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },

  viewLink: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#C44736",
    marginLeft: 8,
  },

  // Sheets
  sheetContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  sheetTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    marginBottom: 16,
  },
  sheetEmpty: {
    textAlign: "center",
    color: "#9CA3AF",
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    marginVertical: 32,
  },
  yearPicker: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    paddingVertical: 8,
    marginBottom: 16,
  },
  yearText: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#111827",
  },

  // Income statement
  stmtCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    gap: 10,
  },
  stmtRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stmtLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
  },
  stmtVal: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#111827",
  },
  stmtDivider: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 10,
    marginTop: 2,
  },
  breakdownTitle: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    color: "#C44736",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  breakdownLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#374151",
    textTransform: "capitalize",
  },
  breakdownVal: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },

  // Tax history
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  historyIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#FDECEC",
    justifyContent: "center",
    alignItems: "center",
  },
  historyRowTitle: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#111827",
    marginBottom: 2,
  },
  historyRowSub: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
    textTransform: "capitalize",
  },
  historyRowAmount: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: "#374151",
  },
});

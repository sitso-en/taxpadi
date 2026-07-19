import React, { useCallback, useEffect, useState } from "react";
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

import {
  exportReport,
  getExportStatus,
  getReportsSummary,
} from "@/services/reports.service";
import { getUserFriendlyError } from "@/utils/error";
import { useToast } from "@/context/ToastContext";

type Summary = {
  income: { total: number };
  expenses: { total: number };
  net_profit: number;
  tax_liability: number;
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
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    try {
      const res = await getReportsSummary();
      setSummary(res.data);
    } catch (error: any) {
      showToast(getUserFriendlyError(error), "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const shareFile = async (fileUrl: string, format: "pdf" | "excel") => {
    const ext = format === "pdf" ? "pdf" : "xlsx";
    const mimeType =
      format === "pdf"
        ? "application/pdf"
        : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    const localUri = `${FileSystem.cacheDirectory}taxpadi_report_${Date.now()}.${ext}`;
    const { uri } = await FileSystem.downloadAsync(fileUrl, localUri);
    await Sharing.shareAsync(uri, { mimeType, dialogTitle: "Share Report" });
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
        await shareFile(directUrl, format);
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
          const fileUrl: string | undefined = statusRes.data?.file_url ?? statusRes.data?.fileUrl;
          if (fileUrl) {
            await shareFile(fileUrl, format);
          } else {
            showToast("File URL not found.", "error");
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

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#C44736" />
      </View>
    );
  }

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

      {/* Business Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryIcon}>
          <Ionicons name="analytics-outline" size={28} color="#FFFFFF" />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.summaryTitle}>Business Summary</Text>
          <Text style={styles.summarySubtitle}>
            Income • GH¢ {Number(summary?.income?.total ?? 0).toFixed(2)}
          </Text>
          <Text style={styles.summarySubtitle}>
            Expenses • GH¢ {Number(summary?.expenses?.total ?? 0).toFixed(2)}
          </Text>
          <Text style={styles.summarySubtitle}>
            Net Profit • GH¢ {Number(summary?.net_profit ?? 0).toFixed(2)}
          </Text>
          <Text style={styles.summarySubtitle}>
            Tax Liability • GH¢ {Number(summary?.tax_liability ?? 0).toFixed(2)}
          </Text>
        </View>
      </View>

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
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.pdfButton, exporting === `${report.exportType}-pdf` && { opacity: 0.7 }]}
              onPress={() => handleExport("pdf", report.exportType)}
              disabled={!!exporting}
            >
              <Ionicons
                name="share-outline"
                size={18}
                color="#FFFFFF"
                style={{ marginRight: 5 }}
              />
              <Text style={styles.pdfText}>
                {exporting === `${report.exportType}-pdf`
                  ? "Exporting…"
                  : "Share PDF"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.csvButton, exporting === `${report.exportType}-excel` && { opacity: 0.7 }]}
              onPress={() => handleExport("excel", report.exportType)}
              disabled={!!exporting}
            >
              <Ionicons
                name="share-outline"
                size={18}
                color="#111827"
                style={{ marginRight: 5 }}
              />
              <Text style={styles.csvText}>
                {exporting === `${report.exportType}-excel`
                  ? "Exporting…"
                  : "Share Excel"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
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

  centered: {
    justifyContent: "center",
    alignItems: "center",
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

  summaryCard: {
    backgroundColor: "#C44736",
    borderRadius: 20,
    paddingVertical: 22,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#C44736",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },

  summaryIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.5)",
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    flexShrink: 0,
  },

  summaryTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    marginBottom: 6,
  },

  summarySubtitle: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 13,
    marginTop: 2,
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
});

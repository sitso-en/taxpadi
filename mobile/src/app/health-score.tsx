import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getHealthScore } from "@/services/user.service";
import SubscriptionGate from "@/components/SubscriptionGate";
import { useSubscription } from "@/context/SubscriptionContext";

type BreakdownKey = "income_consistency" | "expense_discipline" | "tax_compliance" | "savings_behavior";

interface HealthScoreData {
  score: number;
  grade: string;
  income_consistency: number;
  expense_discipline: number;
  tax_compliance: number;
  savings_behavior: number;
}

const BREAKDOWN_CONFIG: {
  key: BreakdownKey;
  label: string;
  weight: number;
  icon: string;
  color: string;
}[] = [
  {
    key: "tax_compliance",
    label: "Tax Compliance",
    weight: 30,
    icon: "shield-checkmark-outline",
    color: "#C44736",
  },
  {
    key: "income_consistency",
    label: "Income Consistency",
    weight: 30,
    icon: "trending-up-outline",
    color: "#3B82F6",
  },
  {
    key: "expense_discipline",
    label: "Expense Discipline",
    weight: 25,
    icon: "card-outline",
    color: "#8B5CF6",
  },
  {
    key: "savings_behavior",
    label: "Savings Behaviour",
    weight: 15,
    icon: "wallet-outline",
    color: "#34A853",
  },
];

function gradeColor(grade: string): string {
  switch (grade?.toLowerCase()) {
    case "excellent": return "#16A34A";
    case "good": return "#34A853";
    case "fair": return "#D97706";
    case "poor": return "#DC2626";
    default: return "#6B7280";
  }
}

function scoreColor(score: number): string {
  if (score >= 80) return "#16A34A";
  if (score >= 60) return "#D97706";
  return "#DC2626";
}

function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <View style={barStyles.track}>
      <View style={[barStyles.fill, { width: `${Math.min(value, 100)}%`, backgroundColor: color }]} />
    </View>
  );
}

const barStyles = StyleSheet.create({
  track: {
    height: 6,
    backgroundColor: "#EDE8E3",
    borderRadius: 3,
    overflow: "hidden",
    flex: 1,
  },
  fill: {
    height: 6,
    borderRadius: 3,
  },
});

export default function HealthScoreScreen() {
  const { isPro } = useSubscription();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<HealthScoreData | null>(null);
  const [noData, setNoData] = useState(false);

  useEffect(() => {
    getHealthScore()
      .then((res) => {
        setData(res.data ?? res);
      })
      .catch((err: any) => {
        const status = err?.response?.status;
        if (status === 404 || status === 422) {
          setNoData(true);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (!isPro) return (
    <SubscriptionGate
      feature="Financial Health Score"
      description="Get a personalised score across tax compliance, income consistency, expense discipline, and savings behaviour."
      icon="pulse-outline"
    />
  );

  const ring = data ? Math.min(data.score, 100) : 0;
  const color = data ? scoreColor(data.score) : "#9CA3AF";
  const grade = data?.grade ?? "";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 48 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Financial Health</Text>
        <View style={{ width: 26 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#C44736" style={{ marginTop: 60 }} />
      ) : noData ? (
        /* Empty state */
        <View style={styles.emptyCard}>
          <Ionicons name="analytics-outline" size={52} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>Not enough data yet</Text>
          <Text style={styles.emptySubtitle}>
            Your health score is calculated once you have recorded several
            transactions. Keep logging your income and expenses — your score
            will appear here soon.
          </Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => router.push("/(tabs)/add-transaction")}
          >
            <Text style={styles.emptyBtnText}>Add a Transaction</Text>
          </TouchableOpacity>
        </View>
      ) : data ? (
        <>
          {/* Score hero */}
          <View style={styles.heroCard}>
            <View style={styles.scoreRingWrap}>
              <View style={[styles.scoreRing, { borderColor: color }]}>
                <Text style={[styles.scoreNumber, { color }]}>{data.score}</Text>
                <Text style={styles.scoreOutOf}>/100</Text>
              </View>
            </View>
            <View style={{ alignItems: "center", marginTop: 14 }}>
              <View style={[styles.gradePill, { backgroundColor: gradeColor(grade) + "20" }]}>
                <Text style={[styles.gradeText, { color: gradeColor(grade) }]}>
                  {grade.charAt(0).toUpperCase() + grade.slice(1).toLowerCase()}
                </Text>
              </View>
              <Text style={styles.heroSubtitle}>
                Your overall financial health score
              </Text>
            </View>
          </View>

          {/* Breakdown */}
          <Text style={styles.sectionTitle}>Score Breakdown</Text>
          <View style={styles.breakdownCard}>
            {BREAKDOWN_CONFIG.map((item, index) => {
              const val = data[item.key] ?? 0;
              return (
                <View
                  key={item.key}
                  style={[
                    styles.breakdownRow,
                    index < BREAKDOWN_CONFIG.length - 1 && styles.breakdownBorder,
                  ]}
                >
                  <View style={[styles.breakdownIcon, { backgroundColor: item.color + "18" }]}>
                    <Ionicons name={item.icon as any} size={16} color={item.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.breakdownLabelRow}>
                      <Text style={styles.breakdownLabel}>{item.label}</Text>
                      <Text style={[styles.breakdownScore, { color: scoreColor(val) }]}>
                        {val}
                      </Text>
                    </View>
                    <View style={styles.breakdownBarRow}>
                      <ScoreBar value={val} color={scoreColor(val)} />
                      <Text style={styles.breakdownWeight}>{item.weight}%</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Info card */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={18} color="#6B7280" />
            <Text style={styles.infoText}>
              Your score is recalculated each time you add transactions. It
              reflects your recent tax filings, income patterns, expense habits,
              and savings activity.
            </Text>
          </View>
        </>
      ) : null}
    </ScrollView>
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
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#111827",
  },

  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  scoreRingWrap: {
    alignItems: "center",
  },
  scoreRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  scoreNumber: {
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    lineHeight: 40,
  },
  scoreOutOf: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
  },
  gradePill: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 8,
  },
  gradeText: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  heroSubtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
  },

  sectionTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    marginBottom: 12,
  },
  breakdownCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  breakdownRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    gap: 12,
  },
  breakdownBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  breakdownIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  breakdownLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  breakdownLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#374151",
  },
  breakdownScore: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  breakdownBarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  breakdownWeight: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
    width: 28,
    textAlign: "right",
  },

  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    lineHeight: 18,
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    marginTop: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  emptyTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 20,
  },
  emptyBtn: {
    backgroundColor: "#C44736",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  emptyBtnText: {
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
});

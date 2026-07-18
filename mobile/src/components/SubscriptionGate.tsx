import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSubscription } from "@/context/SubscriptionContext";

const PRO_PERKS = [
  "Reports & Export (PDF / Excel)",
  "PAYE & payroll management",
  "VAT & withholding tax tracking",
  "Savings Vault",
  "GRA compliance certificates",
  "Bulk transaction import",
  "Financial health score",
];

type Props = {
  /** Short label shown in the paywall headline, e.g. "Reports & Export" */
  feature: string;
  /** One-sentence description of what they unlock */
  description: string;
  /** Ionicons icon name for the feature */
  icon: string;
  /** Omit to use as a standalone paywall screen (early-return pattern) */
  children?: React.ReactNode;
};

export default function SubscriptionGate({ feature, description, icon, children }: Props) {
  const { isPro, isExpired, loading } = useSubscription();

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#C44736" />
      </View>
    );
  }

  if (isPro) {
    return <>{children}</>;
  }

  // Paywall
  const headline = isExpired
    ? "Your subscription has expired"
    : `${feature} is a Pro feature`;

  const subheadline = isExpired
    ? `Renew your subscription to continue using ${feature} and all other Pro features.`
    : description;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      {/* Back button */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => router.back()}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="chevron-back" size={24} color="#111827" />
      </TouchableOpacity>

      {/* Hero */}
      <View style={styles.hero}>
        <View style={[styles.iconRing, isExpired && styles.iconRingExpired]}>
          <Ionicons name={icon as any} size={34} color={isExpired ? "#D97706" : "#C44736"} />
        </View>
        <View style={styles.badge}>
          <Ionicons name="rocket-outline" size={11} color="#C44736" />
          <Text style={styles.badgeText}>PRO</Text>
        </View>
      </View>

      <Text style={styles.headline}>{headline}</Text>
      <Text style={styles.subheadline}>{subheadline}</Text>

      {/* What's included */}
      {!isExpired && (
        <View style={styles.perksCard}>
          <Text style={styles.perksTitle}>Everything in TaxPadi Pro</Text>
          {PRO_PERKS.map((perk) => (
            <View key={perk} style={styles.perkRow}>
              <View style={[styles.perkDot, perk.startsWith(feature) && styles.perkDotHighlight]} />
              <Text style={[styles.perkText, perk.startsWith(feature) && styles.perkTextHighlight]}>
                {perk}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* CTA */}
      <TouchableOpacity
        style={styles.upgradeBtn}
        onPress={() => router.push("/manage-plan")}
        activeOpacity={0.88}
      >
        <Ionicons name="rocket-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
        <Text style={styles.upgradeBtnText}>
          {isExpired ? "Renew Subscription" : "Upgrade to Pro"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backLink}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <Text style={styles.backLinkText}>Not now — go back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: "#F2EDE8",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#F2EDE8",
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 52,
    paddingBottom: 48,
    alignItems: "center",
  },

  backBtn: {
    alignSelf: "flex-start",
    marginBottom: 32,
  },

  hero: {
    alignItems: "center",
    marginBottom: 8,
  },
  iconRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#FDECEC",
    borderWidth: 3,
    borderColor: "#F8C5BF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  iconRingExpired: {
    backgroundColor: "#FFFBEB",
    borderColor: "#FDE68A",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#FFF8F6",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#F8C5BF",
  },
  badgeText: {
    color: "#C44736",
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
  },

  headline: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 10,
    lineHeight: 30,
  },
  subheadline: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 28,
    maxWidth: 300,
  },

  perksCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#EFEFED",
  },
  perksTitle: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    marginBottom: 14,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  perkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  perkDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D1D5DB",
    flexShrink: 0,
  },
  perkDotHighlight: {
    backgroundColor: "#C44736",
  },
  perkText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    flex: 1,
  },
  perkTextHighlight: {
    color: "#111827",
    fontFamily: "Inter_600SemiBold",
  },

  upgradeBtn: {
    width: "100%",
    backgroundColor: "#C44736",
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#C44736",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
    marginBottom: 14,
  },
  upgradeBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },

  backLink: {
    paddingVertical: 10,
  },
  backLinkText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#9CA3AF",
  },
});

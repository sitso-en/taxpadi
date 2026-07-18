import React, { useCallback, useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  checkEligibility,
  dismissOffer,
  getReferralOffers,
  markClicked,
  markViewed,
} from "../services/referrals.service";
import { useToast } from "@/context/ToastContext";
import { useNetwork } from "@/context/NetworkContext";

type Offer = {
  id: string;
  productName: string;
  partnerName: string;
  offerType: string;
  maxAmount: number | null;
  interestRate: number | null;
  description: string;
  status: string;
  expiresAt: string | null;
};

type EligibilityBasis = {
  months_of_data: number;
  consistency_score: number;
};

type Eligibility = {
  eligible: boolean;
  eligibility_basis?: EligibilityBasis;
};

function normalizeOffer(raw: any): Offer {
  return {
    id: raw.offer_id ?? "",
    productName: raw.product_name ?? "Referral Offer",
    partnerName: raw.partner_name ?? "",
    offerType: raw.offer_type ?? "",
    maxAmount: raw.max_amount ?? null,
    interestRate: raw.interest_rate ?? null,
    description: raw.description ?? "",
    status: (raw.status ?? "ACTIVE").toUpperCase(),
    expiresAt: raw.expires_at ?? null,
  };
}

const OFFER_TYPE_ICON: Record<string, any> = {
  LOAN: "cash-outline",
  INSURANCE: "shield-checkmark-outline",
  SAVINGS: "wallet-outline",
  INVESTMENT: "trending-up-outline",
};

export default function ReferralOffersScreen() {
  const { showToast } = useToast();
  const { isOnline } = useNetwork();

  const [offers, setOffers] = useState<Offer[]>([]);
  const [eligibility, setEligibility] = useState<Eligibility | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionRequired, setSubscriptionRequired] = useState(false);
  const [actioning, setActioning] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [offersRes, eligRes] = await Promise.all([
        getReferralOffers(),
        checkEligibility(),
      ]);

      const rawOffers: any[] = offersRes?.data?.offers ?? [];
      const mapped = rawOffers.map(normalizeOffer).filter((o) => o.id);
      setOffers(mapped);
      setEligibility(eligRes?.data ?? null);

      // Mark all ACTIVE offers as VIEWED silently
      mapped
        .filter((o) => o.status === "ACTIVE")
        .forEach((o) => markViewed(o.id).catch(() => {}));
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 403) {
        setSubscriptionRequired(true);
      } else {
        showToast("Could not load referral offers.", "error");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleApply = async (offer: Offer) => {
    if (!isOnline) { showToast("You're offline.", "info"); return; }
    if (actioning) return;
    setActioning(offer.id);
    try {
      const res = await markClicked(offer.id);
      const deepLink = res?.data?.deep_link;

      // Update status locally
      setOffers((prev) => prev.map((o) => o.id === offer.id ? { ...o, status: "CLICKED" } : o));

      if (deepLink) {
        await Linking.openURL(deepLink);
      } else {
        showToast(`Opening ${offer.partnerName} application…`, "success");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Could not apply for this offer.";
      showToast(msg, "error");
    } finally {
      setActioning(null);
    }
  };

  const handleDismiss = async (offer: Offer) => {
    setActioning(offer.id);
    try {
      await dismissOffer(offer.id);
      setOffers((prev) => prev.filter((o) => o.id !== offer.id));
    } catch {
      // silently ignore
    } finally {
      setActioning(null);
    }
  };

  const fmtAmount = (o: Offer) => {
    if (o.maxAmount == null) return null;
    const base = `Up to GH¢ ${o.maxAmount.toLocaleString("en-GH")}`;
    return o.interestRate != null ? `${base} at ${o.interestRate}% p.a.` : base;
  };

  const score = eligibility?.eligibility_basis?.consistency_score;
  const months = eligibility?.eligibility_basis?.months_of_data ?? 0;

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { justifyContent: "center", alignItems: "center" }]} edges={["top"]}>
        <ActivityIndicator size="large" color="#C44736" />
      </SafeAreaView>
    );
  }

  if (subscriptionRequired) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="chevron-back" size={26} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.title}>Referral Offers</Text>
          <View style={{ width: 26 }} />
        </View>
        <View style={styles.gateCard}>
          <View style={styles.gateIconBox}>
            <Ionicons name="lock-closed-outline" size={28} color="#C44736" />
          </View>
          <Text style={styles.gateTitle}>Subscription Required</Text>
          <Text style={styles.gateSub}>
            Referral offers are available to TaxPadi subscribers. Upgrade your plan to access partner loans, insurance, and savings offers.
          </Text>
          <TouchableOpacity style={styles.upgradeBtn} onPress={() => router.push("/subscription")} activeOpacity={0.85}>
            <Text style={styles.upgradeBtnText}>View Plans</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Referral Offers</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── Eligibility banner ── */}
        <View style={styles.eligibilityCard}>
          <View style={styles.eligibilityLeft}>
            <View style={[styles.eligibilityIconBox, { backgroundColor: eligibility?.eligible ? "#DCFCE7" : "#FEF3C7" }]}>
              <Ionicons
                name={eligibility?.eligible ? "checkmark-circle-outline" : "time-outline"}
                size={24}
                color={eligibility?.eligible ? "#16A34A" : "#D97706"}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.eligibilityTitle}>
                {eligibility?.eligible ? "You're eligible for offers" : "Building eligibility…"}
              </Text>
              <Text style={styles.eligibilitySub}>
                {eligibility?.eligible
                  ? `${months} months of data on TaxPadi`
                  : `${months}/3 months of data needed`}
              </Text>
            </View>
          </View>
          {score != null && (
            <View style={styles.scoreBox}>
              <Text style={styles.scoreNum}>{score}</Text>
              <Text style={styles.scoreLabel}>score</Text>
            </View>
          )}
        </View>

        {/* ── Offers ── */}
        {offers.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconBox}>
              <Ionicons name="gift-outline" size={28} color="#C44736" />
            </View>
            <Text style={styles.emptyTitle}>No offers yet</Text>
            <Text style={styles.emptySub}>
              Keep using TaxPadi — partner offers will appear here as you build your financial profile.
            </Text>
          </View>
        ) : (
          offers.map((offer) => {
            const amountText = fmtAmount(offer);
            const icon = OFFER_TYPE_ICON[offer.offerType] ?? "cash-outline";
            const isClicked = offer.status === "CLICKED";
            const isActioning = actioning === offer.id;

            return (
              <View key={offer.id} style={styles.offerCard}>
                {/* Header row */}
                <View style={styles.offerTopRow}>
                  <View style={styles.offerIconBox}>
                    <Ionicons name={icon} size={20} color="#C44736" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.offerPartner}>{offer.partnerName}</Text>
                    <Text style={styles.offerType}>{offer.offerType}</Text>
                  </View>
                  {isClicked ? (
                    <View style={styles.appliedBadge}>
                      <Text style={styles.appliedBadgeText}>Applied</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => handleDismiss(offer)}
                      disabled={isActioning}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="close" size={18} color="#9CA3AF" />
                    </TouchableOpacity>
                  )}
                </View>

                <Text style={styles.offerTitle}>{offer.productName}</Text>

                {amountText && <Text style={styles.offerAmount}>{amountText}</Text>}

                {offer.description ? (
                  <Text style={styles.offerDesc}>{offer.description}</Text>
                ) : null}

                {offer.expiresAt && (
                  <Text style={styles.offerExpiry}>
                    Expires {new Date(offer.expiresAt).toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" })}
                  </Text>
                )}

                {!isClicked && (
                  eligibility?.eligible ? (
                    <TouchableOpacity
                      style={[styles.applyBtn, isActioning && { opacity: 0.6 }]}
                      onPress={() => handleApply(offer)}
                      disabled={isActioning}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.applyBtnText}>{isActioning ? "Opening…" : "Apply Now"}</Text>
                      <Ionicons name="arrow-forward" size={15} color="#FFFFFF" />
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.lockedBtn}>
                      <Ionicons name="lock-closed-outline" size={13} color="#9CA3AF" />
                      <Text style={styles.lockedBtnText}>Build 3 months of data to unlock</Text>
                    </View>
                  )
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F2EDE8" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },

  title: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#111827" },

  scroll: { paddingHorizontal: 20, paddingBottom: 48 },

  // ── Eligibility ──
  eligibilityCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  eligibilityLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },

  eligibilityIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  eligibilityTitle: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#111827", marginBottom: 3 },
  eligibilitySub: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#6B7280" },

  scoreBox: { alignItems: "center", marginLeft: 12 },
  scoreNum: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#C44736" },
  scoreLabel: { fontSize: 10, fontFamily: "Inter_500Medium", color: "#9CA3AF", marginTop: -2 },

  // ── Empty ──
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
  },

  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#FDECEC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  emptyTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#111827", marginBottom: 6 },
  emptySub: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#6B7280", textAlign: "center", lineHeight: 20 },

  // ── Offer card ──
  offerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  offerTopRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },

  offerIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#FDECEC",
    justifyContent: "center",
    alignItems: "center",
  },

  offerPartner: { fontSize: 12, fontFamily: "Inter_500Medium", color: "#9CA3AF" },
  offerType: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#C9B8B5", marginTop: 1 },

  appliedBadge: { backgroundColor: "#DCFCE7", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  appliedBadgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#16A34A" },

  offerTitle: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#111827", marginBottom: 4 },

  offerAmount: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#C44736", marginBottom: 6 },

  offerDesc: { fontSize: 12, fontFamily: "Inter_400Regular", color: "#6B7280", lineHeight: 18, marginBottom: 8 },

  offerExpiry: { fontSize: 11, fontFamily: "Inter_400Regular", color: "#9CA3AF", marginBottom: 8 },

  applyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#C44736",
    borderRadius: 10,
    paddingVertical: 10,
    shadowColor: "#C44736",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  applyBtnText: { color: "#FFFFFF", fontFamily: "Inter_600SemiBold", fontSize: 13 },

  lockedBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingVertical: 10,
  },

  lockedBtnText: { color: "#9CA3AF", fontFamily: "Inter_500Medium", fontSize: 12 },

  // ── Subscription gate ──
  gateCard: {
    margin: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  gateIconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#FDECEC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  gateTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#111827", marginBottom: 8 },

  gateSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },

  upgradeBtn: {
    backgroundColor: "#C44736",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    shadowColor: "#C44736",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  upgradeBtnText: { color: "#FFFFFF", fontFamily: "Inter_600SemiBold", fontSize: 15 },
});

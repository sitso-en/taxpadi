import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCertificates } from "../context/CertificateContext";
import { getUserFriendlyError } from "@/utils/error";
import { useToast } from "@/context/ToastContext";
import SubscriptionGate from "@/components/SubscriptionGate";
import { useSubscription } from "@/context/SubscriptionContext";
import BottomSheet from "@/components/BottomSheet";

const GRA_LOGO = require("../../assets/images/gra.png");

const TAX_TYPE_LABELS: Record<string, string> = {
  income_tax: "Income Tax",
  vat: "VAT",
  paye: "PAYE",
  withholding: "Withholding Tax",
  corporate_tax: "Corporate Tax",
};

function fmtLong(d: string) {
  return new Date(d).toLocaleDateString("en-GH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function fmtShort(d: string) {
  return new Date(d).toLocaleDateString("en-GH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const CORNER_SIZE = 22;
const CORNER_W = 2.5;

const TAX_TYPE_OPTIONS = [
  { key: "income_tax",     label: "Income Tax" },
  { key: "vat",            label: "VAT" },
  { key: "paye",           label: "PAYE" },
  { key: "withholding",    label: "Withholding Tax" },
  { key: "corporate_tax",  label: "Corporate Tax" },
];

export default function ComplianceCertificateScreen() {
  const { isPro } = useSubscription();
  const { showToast } = useToast();
  const { certificates, loading, downloadCertificate, refreshCertificates, requestCertificate } = useCertificates();

  const [showRequest, setShowRequest] = useState(false);
  const [reqTaxType, setReqTaxType] = useState("income_tax");
  const [reqYear, setReqYear] = useState(new Date().getFullYear() - 1);
  const [requesting, setRequesting] = useState(false);

  const handleRequest = async () => {
    setRequesting(true);
    try {
      await requestCertificate(reqTaxType, reqYear);
      showToast("Certificate request submitted successfully.", "success");
      setShowRequest(false);
    } catch (error: any) {
      showToast(getUserFriendlyError(error), "error");
    } finally {
      setRequesting(false);
    }
  };

  if (!isPro) return (
    <SubscriptionGate
      feature="Compliance Certificate"
      description="Request and download GRA tax compliance certificates to share with banks, clients, and institutions."
      icon="shield-checkmark-outline"
    />
  );

  const latest = certificates[0] ?? null;
  const previous = certificates.slice(1);
  const isActive = latest?.status === "ACTIVE";

  const handleDownload = async (id: string) => {
    try {
      const url = await downloadCertificate(id);
      if (!url) {
        showToast("Certificate PDF is not available yet.", "info");
        return;
      }
      const localUri = `${FileSystem.cacheDirectory}taxpadi_certificate_${Date.now()}.pdf`;
      const { uri } = await FileSystem.downloadAsync(url, localUri);
      await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: "Share Certificate" });
    } catch (error) {
      showToast(getUserFriendlyError(error), "error");
    }
  };

  const handleShare = async () => {
    if (!latest) return;
    try {
      await Share.share({
        message: `TaxPadi — Tax Compliance Certificate\nRef: ${latest.documentRef}\nTax Type: ${TAX_TYPE_LABELS[latest.taxType] ?? latest.taxType}\nPeriod: ${fmtShort(latest.periodStart)} – ${fmtShort(latest.periodEnd)}\nIssued: ${fmtLong(latest.issuedAt)}`,
      });
    } catch {}
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Compliance Certificate</Text>
        <TouchableOpacity style={styles.refreshPill} onPress={() => refreshCertificates()} activeOpacity={0.8}>
          <Ionicons name="refresh-outline" size={14} color="#C44736" />
          <Text style={styles.refreshPillText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {loading ? (
          <ActivityIndicator size="large" color="#C44736" style={{ marginTop: 80 }} />
        ) : !latest ? (
          /* ── No certificate ── */
          <View style={styles.certCard}>
            {/* Stripe */}
            <View style={[styles.stripe, { backgroundColor: "#9CA3AF" }]}>
              <Text style={styles.stripeWordmark}>GHANA REVENUE AUTHORITY</Text>
              <Image source={GRA_LOGO} style={styles.stripeLogo} resizeMode="contain" />
              <Text style={styles.stripeCertTitle}>TAX COMPLIANCE CERTIFICATE</Text>
            </View>

            <View style={styles.certBody}>
              <View style={[styles.corner, styles.cTL, { borderColor: "#9CA3AF" }]} />
              <View style={[styles.corner, styles.cTR, { borderColor: "#9CA3AF" }]} />
              <View style={[styles.corner, styles.cBL, { borderColor: "#9CA3AF" }]} />
              <View style={[styles.corner, styles.cBR, { borderColor: "#9CA3AF" }]} />

              <View style={styles.noCertStampWrap}>
                <View style={styles.noCertStampBox}>
                  <Text style={styles.noCertStampText}>NOT ISSUED</Text>
                </View>
              </View>

              <Text style={styles.noCertHint}>
                Complete your tax filings and make a payment, then request your compliance certificate from the Ghana Revenue Authority.
              </Text>

              <TouchableOpacity
                style={styles.requestBtn}
                onPress={() => setShowRequest(true)}
                activeOpacity={0.85}
              >
                <Ionicons name="shield-checkmark-outline" size={16} color="#FFFFFF" />
                <Text style={styles.requestBtnText}>Request Certificate</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.goPayBtn, { marginTop: 10 }]}
                onPress={() => router.push("/payments")}
                activeOpacity={0.85}
              >
                <Text style={styles.goPayBtnText}>Make a Payment First</Text>
                <Ionicons name="arrow-forward" size={15} color="#C44736" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            {/* ── Main certificate ── */}
            <View style={styles.certCard}>
              {/* Top stripe / letterhead */}
              <View style={[styles.stripe, { backgroundColor: isActive ? "#C44736" : "#6B7280" }]}>
                <Text style={styles.stripeWordmark}>GHANA REVENUE AUTHORITY</Text>
                <Image source={GRA_LOGO} style={styles.stripeLogo} resizeMode="contain" />
                <Text style={styles.stripeCertTitle}>TAX COMPLIANCE CERTIFICATE</Text>
              </View>

              {/* Certificate body */}
              <View style={styles.certBody}>
                {/* Corner brackets */}
                <View style={[styles.corner, styles.cTL, { borderColor: isActive ? "#C44736" : "#9CA3AF" }]} />
                <View style={[styles.corner, styles.cTR, { borderColor: isActive ? "#C44736" : "#9CA3AF" }]} />
                <View style={[styles.corner, styles.cBL, { borderColor: isActive ? "#C44736" : "#9CA3AF" }]} />
                <View style={[styles.corner, styles.cBR, { borderColor: isActive ? "#C44736" : "#9CA3AF" }]} />

                {/* Cert number */}
                <Text style={styles.certNumLabel}>CERTIFICATE NUMBER</Text>
                <Text style={styles.certNum}>{latest.documentRef}</Text>

                <View style={styles.divider} />

                {/* Certifying statement */}
                <Text style={styles.certStatement}>
                  This is to certify that the above-named taxpayer has satisfied their statutory tax compliance obligations with the Ghana Revenue Authority for the period indicated below.
                </Text>

                <View style={styles.divider} />

                {/* Details */}
                <View style={styles.detailsGrid}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>TAX TYPE</Text>
                    <Text style={styles.detailValue}>{TAX_TYPE_LABELS[latest.taxType] ?? latest.taxType}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>AMOUNT PAID</Text>
                    <Text style={styles.detailValue}>
                      GH¢ {(latest.amountPaid ?? 0).toLocaleString("en-GH", { minimumFractionDigits: 2 })}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>PERIOD START</Text>
                    <Text style={styles.detailValue}>{fmtShort(latest.periodStart)}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>PERIOD END</Text>
                    <Text style={styles.detailValue}>{fmtShort(latest.periodEnd)}</Text>
                  </View>
                  <View style={[styles.detailItem, { width: "100%" }]}>
                    <Text style={styles.detailLabel}>DATE OF ISSUE</Text>
                    <Text style={styles.detailValue}>{fmtLong(latest.issuedAt)}</Text>
                  </View>
                  {latest.validUntil && (
                    <View style={[styles.detailItem, { width: "100%" }]}>
                      <Text style={styles.detailLabel}>VALID UNTIL</Text>
                      <Text style={[styles.detailValue, { color: isActive ? "#16A34A" : "#DC2626" }]}>
                        {fmtLong(latest.validUntil)}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.divider} />

                {/* Stamp + signature */}
                <View style={styles.stampRow}>
                  <View style={[styles.stamp, { borderColor: isActive ? "#16A34A" : "#DC2626" }]}>
                    <Text style={[styles.stampText, { color: isActive ? "#16A34A" : "#DC2626" }]}>
                      {isActive ? "✓  VALID" : "✕  EXPIRED"}
                    </Text>
                  </View>
                  <View style={styles.sigBlock}>
                    <View style={styles.sigLine} />
                    <Text style={styles.sigLabel}>Commissioner-General</Text>
                    <Text style={styles.sigSub}>Ghana Revenue Authority</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* ── Compliance status summary ── */}
            <View style={styles.statusCard}>
              <View style={styles.statusIconBox}>
                <Ionicons
                  name={isActive ? "shield-checkmark-outline" : "shield-outline"}
                  size={22}
                  color="#C44736"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.statusTitle}>
                  {isActive ? "You are tax compliant" : "Compliance has lapsed"}
                </Text>
                <Text style={styles.statusSub}>
                  {isActive
                    ? "Your certificate is recognised by the GRA and can be presented to third parties."
                    : "Renew your compliance by filing outstanding returns and making payment."}
                </Text>
              </View>
            </View>

            {/* ── Actions ── */}
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.85}>
                <Ionicons name="share-outline" size={18} color="#111827" />
                <Text style={styles.shareBtnText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.downloadBtn} onPress={() => handleDownload(latest.id)} activeOpacity={0.85}>
                <Ionicons name="download-outline" size={18} color="#FFFFFF" />
                <Text style={styles.downloadBtnText}>Download PDF</Text>
              </TouchableOpacity>
            </View>

            {/* ── Request new certificate ── */}
            <TouchableOpacity
              style={styles.requestNewBtn}
              onPress={() => setShowRequest(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="add-circle-outline" size={18} color="#C44736" />
              <Text style={styles.requestNewBtnText}>Request New Certificate</Text>
            </TouchableOpacity>

            {/* ── Previous certificates ── */}
            {previous.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Previous Certificates</Text>
                {previous.map((item) => {
                  const active = item.status === "ACTIVE";
                  return (
                    <View key={item.id} style={styles.prevCard}>
                      <View style={styles.prevLeft}>
                        <View style={styles.prevIconBox}>
                          <Ionicons name="document-text-outline" size={16} color="#C44736" />
                        </View>
                        <View style={{ marginLeft: 12 }}>
                          <Text style={styles.prevRef}>{item.documentRef}</Text>
                          <Text style={styles.prevMeta}>
                            {TAX_TYPE_LABELS[item.taxType] ?? item.taxType} · {new Date(item.periodStart).getFullYear()}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.prevRight}>
                        <Text style={[styles.prevStatus, { color: active ? "#16A34A" : "#9CA3AF" }]}>
                          {active ? "✓ Valid" : "✕ Expired"}
                        </Text>
                        <TouchableOpacity onPress={() => handleDownload(item.id)} style={{ marginTop: 6 }}>
                          <Text style={styles.prevDownload}>Download</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </>
            )}
          </>
        )}
      </ScrollView>

      {/* ── Request Certificate Sheet ── */}
      <BottomSheet visible={showRequest} onClose={() => setShowRequest(false)}>
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Request Certificate</Text>
          <Text style={styles.sheetSub}>
            Select the tax type and year for your compliance certificate request.
          </Text>

          <Text style={styles.sheetLabel}>TAX TYPE</Text>
          <View style={styles.chipGrid}>
            {TAX_TYPE_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.chip, reqTaxType === opt.key && styles.chipActive]}
                onPress={() => setReqTaxType(opt.key)}
              >
                <Text style={[styles.chipText, reqTaxType === opt.key && styles.chipTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.sheetLabel, { marginTop: 20 }]}>TAX YEAR</Text>
          <View style={styles.yearRow}>
            <TouchableOpacity
              style={styles.yearBtn}
              onPress={() => setReqYear((y) => y - 1)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="remove" size={20} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.yearText}>{reqYear}</Text>
            <TouchableOpacity
              style={styles.yearBtn}
              onPress={() => setReqYear((y) => Math.min(y + 1, new Date().getFullYear()))}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="add" size={20} color="#111827" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.requestBtn, { marginTop: 28 }, requesting && { opacity: 0.7 }]}
            onPress={handleRequest}
            disabled={requesting}
            activeOpacity={0.85}
          >
            <Ionicons name="shield-checkmark-outline" size={16} color="#FFFFFF" />
            <Text style={styles.requestBtnText}>
              {requesting ? "Submitting…" : "Submit Request"}
            </Text>
          </TouchableOpacity>
          <View style={{ height: 8 }} />
        </View>
      </BottomSheet>
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

  title: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#111827" },

  refreshPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#FDECEC",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },

  refreshPillText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#C44736",
  },

  scroll: { paddingHorizontal: 20, paddingBottom: 48 },

  // ── Certificate card ──
  certCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },

  // ── Letterhead stripe ──
  stripe: {
    paddingTop: 28,
    paddingBottom: 24,
    paddingHorizontal: 24,
    alignItems: "center",
  },

  stripeWordmark: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    color: "rgba(255,255,255,0.8)",
    letterSpacing: 3,
    marginBottom: 14,
  },

  stripeLogo: {
    width: 90,
    height: 90,
    marginBottom: 14,
  },

  stripeCertTitle: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    letterSpacing: 2.5,
    textAlign: "center",
  },

  // ── Body ──
  certBody: {
    padding: 24,
  },

  // ── Corner brackets ──
  corner: {
    position: "absolute",
    width: CORNER_SIZE,
    height: CORNER_SIZE,
  },
  cTL: { top: 12, left: 12, borderTopWidth: CORNER_W, borderLeftWidth: CORNER_W },
  cTR: { top: 12, right: 12, borderTopWidth: CORNER_W, borderRightWidth: CORNER_W },
  cBL: { bottom: 12, left: 12, borderBottomWidth: CORNER_W, borderLeftWidth: CORNER_W },
  cBR: { bottom: 12, right: 12, borderBottomWidth: CORNER_W, borderRightWidth: CORNER_W },

  // ── Cert number ──
  certNumLabel: {
    fontSize: 9,
    fontFamily: "Inter_600SemiBold",
    color: "#9CA3AF",
    letterSpacing: 2,
    marginBottom: 6,
  },

  certNum: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    letterSpacing: 0.5,
  },

  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 20,
  },

  // ── Certifying statement ──
  certStatement: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    lineHeight: 22,
    textAlign: "center",
    fontStyle: "italic",
  },

  // ── Details grid ──
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 16,
    columnGap: 12,
  },

  detailItem: {
    width: "47%",
  },

  detailLabel: {
    fontSize: 9,
    fontFamily: "Inter_600SemiBold",
    color: "#9CA3AF",
    letterSpacing: 1.5,
    marginBottom: 4,
  },

  detailValue: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#111827",
  },

  // ── Stamp ──
  stampRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },

  stamp: {
    borderWidth: 3,
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    transform: [{ rotate: "-6deg" }],
  },

  stampText: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    letterSpacing: 3,
  },

  sigBlock: {
    alignItems: "flex-end",
  },

  sigLine: {
    width: 110,
    height: 1.5,
    backgroundColor: "#D1D5DB",
    marginBottom: 6,
  },

  sigLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "#374151",
  },

  sigSub: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
    marginTop: 1,
  },

  // ── No cert ──
  noCertStampWrap: {
    alignItems: "center",
    marginVertical: 32,
  },

  noCertStampBox: {
    borderWidth: 3,
    borderColor: "#DC2626",
    borderRadius: 6,
    paddingHorizontal: 24,
    paddingVertical: 12,
    transform: [{ rotate: "-5deg" }],
  },

  noCertStampText: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: "#DC2626",
    letterSpacing: 4,
  },

  noCertHint: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },

  goPayBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: "#C44736",
    borderRadius: 12,
    paddingVertical: 13,
  },

  goPayBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#C44736",
  },

  // ── Status card ──
  statusCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  statusIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FDECEC",
    justifyContent: "center",
    alignItems: "center",
  },

  statusTitle: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    marginBottom: 4,
  },

  statusSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    lineHeight: 18,
  },

  // ── Action row ──
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 28,
  },

  shareBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 15,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  shareBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#111827",
  },

  downloadBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#C44736",
    borderRadius: 14,
    paddingVertical: 15,
    shadowColor: "#C44736",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  downloadBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },

  // ── Section title ──
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: "#C44736",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 12,
  },

  // ── Previous cards ──
  prevCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  prevLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  prevIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#FDECEC",
    justifyContent: "center",
    alignItems: "center",
  },

  prevRef: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#111827",
  },

  prevMeta: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
    marginTop: 2,
  },

  prevRight: { alignItems: "flex-end" },

  prevStatus: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },

  prevDownload: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "#C44736",
  },

  // ── Request button (empty state + sheet) ──
  requestBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#C44736",
    borderRadius: 14,
    paddingVertical: 14,
    shadowColor: "#C44736",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  requestBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },

  // ── Request new (when certs exist) ──
  requestNewBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: "#C44736",
    borderRadius: 14,
    paddingVertical: 13,
    marginBottom: 28,
  },
  requestNewBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#C44736",
  },

  // ── Request sheet ──
  sheetContent: {
    paddingHorizontal: 22,
    paddingBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    marginBottom: 6,
  },
  sheetSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    lineHeight: 19,
    marginBottom: 22,
  },
  sheetLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "#C44736",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#EDE8E3",
    borderWidth: 1,
    borderColor: "transparent",
  },
  chipActive: {
    backgroundColor: "#FDECEC",
    borderColor: "#FECACA",
  },
  chipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#6B7280",
  },
  chipTextActive: {
    color: "#C44736",
    fontFamily: "Inter_600SemiBold",
  },
  yearRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 28,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 14,
  },
  yearBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  yearText: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    minWidth: 80,
    textAlign: "center",
  },
});

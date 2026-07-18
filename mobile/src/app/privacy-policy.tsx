// =============================================================================
// PLACEHOLDER LEGAL TEXT — This is a professionally drafted template for
// TaxPadi. REPLACE with your actual reviewed and solicitor-approved policy
// before public launch. Update the "Last Updated" date accordingly.
// =============================================================================

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <Text style={styles.body}>{children}</Text>;
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bulletDot}>{"\u2022"}</Text>
      <Text style={styles.bulletText}>{children}</Text>
    </View>
  );
}

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.lastUpdated}>Last Updated: 17 July 2026</Text>

        <View style={styles.introBanner}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#C44736" />
          <Text style={styles.introText}>
            TaxPadi is committed to protecting your personal data. This policy explains what we collect, why we collect it, and how we keep it safe.
          </Text>
        </View>

        <Section title="1. Who We Are">
          <P>
            TaxPadi is a digital tax management service operated by TaxPadi Ghana Limited ("TaxPadi", "we", "us", "our"), incorporated under the laws of the Republic of Ghana. We provide individuals, sole traders, and small businesses with tools to record transactions, compute tax obligations, file returns, and comply with the Ghana Revenue Authority (GRA).
          </P>
          <P>
            {/* PLACEHOLDER: Replace with your registered address and company registration number */}
            Registered Address: [INSERT REGISTERED OFFICE ADDRESS], Ghana.{"\n"}
            Contact: support@taxpadi.com
          </P>
        </Section>

        <Section title="2. Information We Collect">
          <P>We collect information you provide directly and data generated through your use of the app:</P>
          <Bullet>Identity data: full name, date of birth, taxpayer category (Individual, Sole Trader, Small Business).</Bullet>
          <Bullet>Contact data: phone number, email address, region of residence.</Bullet>
          <Bullet>Tax data: Tax Identification Number (TIN), GRA filing references, tax return records, PAYE records, VAT records, withholding tax records.</Bullet>
          <Bullet>Financial data: income transactions, deductible expenses, invoices, payment records, savings vault balances.</Bullet>
          <Bullet>Account data: hashed passwords, refresh tokens, device tokens for push notifications, biometric login tokens (stored as hashes — we never store your biometric data itself).</Bullet>
          <Bullet>Technical data: IP address, device type, operating system, app version, session identifiers, and usage logs.</Bullet>
        </Section>

        <Section title="3. How We Use Your Information">
          <P>We use your personal data to:</P>
          <Bullet>Create and manage your TaxPadi account.</Bullet>
          <Bullet>Compute your tax liabilities (income tax, VAT, PAYE, withholding tax) under current Ghana Revenue Authority rates.</Bullet>
          <Bullet>Generate tax returns and compliance certificates.</Bullet>
          <Bullet>Send you OTP verification codes, deadline reminders, and important account notifications via SMS and push notification.</Bullet>
          <Bullet>Process subscription payments through our payment processor (Paystack).</Bullet>
          <Bullet>Provide personalised savings recommendations through the TaxPadi Savings Vault feature.</Bullet>
          <Bullet>Respond to your support requests.</Bullet>
          <Bullet>Detect fraud, prevent unauthorised access, and maintain app security.</Bullet>
          <Bullet>Comply with applicable law, including GRA reporting obligations.</Bullet>
        </Section>

        <Section title="4. Legal Basis for Processing">
          <P>
            We process your data under the Ghana Data Protection Act, 2012 (Act 843) and, where applicable, the General Data Protection Regulation (GDPR) on the following grounds:
          </P>
          <Bullet>Contract performance: processing necessary to provide the TaxPadi service you have registered for.</Bullet>
          <Bullet>Legal obligation: tax record-keeping required by GRA and other Ghanaian laws.</Bullet>
          <Bullet>Legitimate interests: fraud prevention, app security, and service improvement, where these do not override your rights.</Bullet>
          <Bullet>Consent: for marketing communications and optional features. You may withdraw consent at any time.</Bullet>
        </Section>

        <Section title="5. Sharing Your Information">
          <P>We do not sell your personal data. We share it only as follows:</P>
          <Bullet>GRA and other regulatory authorities: where we are legally required to disclose information, or where you explicitly submit a tax return or request a compliance certificate.</Bullet>
          <Bullet>Paystack Ghana Limited: for processing subscription and tax payment transactions. Paystack is PCI-DSS compliant.</Bullet>
          <Bullet>Wigal / Arkesel SMS: for OTP and notification delivery via SMS. Only your phone number is shared for this purpose.</Bullet>
          <Bullet>Firebase (Google): for push notification delivery. Device tokens are transmitted to Firebase servers.</Bullet>
          <Bullet>AWS S3: for secure storage of generated PDF documents (tax returns, invoices, compliance certificates).</Bullet>
          <Bullet>Anthropic (TaxBot): anonymised query text may be processed by Anthropic's Claude API to generate tax guidance responses. No personally identifiable financial data is included in these queries.</Bullet>
          <Bullet>Service providers acting on our behalf under data processing agreements with equivalent protections to this policy.</Bullet>
        </Section>

        <Section title="6. Data Retention">
          <P>
            We retain your personal and financial data for as long as your account is active and for a minimum of seven (7) years thereafter to meet GRA record-keeping requirements under the Revenue Administration Act, 2016 (Act 915). Device tokens and session data are deleted within 90 days of inactivity.
          </P>
          <P>
            You may request deletion of your account at any time. Where legal obligations require retention, we will retain only the minimum data necessary and restrict its use to compliance purposes only.
          </P>
        </Section>

        <Section title="7. Your Rights">
          <P>Under the Ghana Data Protection Act 2012 and applicable law, you have the right to:</P>
          <Bullet>Access a copy of the personal data we hold about you.</Bullet>
          <Bullet>Correct inaccurate or incomplete data.</Bullet>
          <Bullet>Request deletion of your data, subject to legal retention requirements.</Bullet>
          <Bullet>Object to processing based on legitimate interests.</Bullet>
          <Bullet>Withdraw consent for any processing based on consent, without affecting the lawfulness of prior processing.</Bullet>
          <Bullet>Lodge a complaint with the Data Protection Commission of Ghana.</Bullet>
          <P>To exercise any of these rights, contact us at support@taxpadi.com.</P>
        </Section>

        <Section title="8. Data Security">
          <P>
            We implement industry-standard security measures including AES-256 encryption at rest, TLS 1.2+ in transit, BCrypt password hashing, JWT-based authentication with 15-minute access token expiry, and role-based access controls. Our infrastructure is hosted on cloud platforms with SOC 2 Type II certification.
          </P>
          <P>
            While we take all reasonable steps to protect your data, no transmission over the internet is completely secure. You are responsible for maintaining the confidentiality of your account credentials.
          </P>
        </Section>

        <Section title="9. Children's Privacy">
          <P>
            TaxPadi is not directed at persons under the age of 18. We do not knowingly collect personal data from children. If we become aware that a child has provided us with personal information, we will delete it promptly.
          </P>
        </Section>

        <Section title="10. International Transfers">
          <P>
            Some of our third-party service providers (including AWS, Firebase, and Anthropic) operate outside Ghana. Where data is transferred internationally, we ensure appropriate safeguards are in place, including standard contractual clauses or equivalent mechanisms.
          </P>
        </Section>

        <Section title="11. Changes to This Policy">
          <P>
            We may update this Privacy Policy from time to time. We will notify you of material changes via in-app notification or email at least 14 days before the changes take effect. Continued use of TaxPadi after the effective date constitutes acceptance of the updated policy.
          </P>
        </Section>

        <Section title="12. Contact Us">
          <P>
            {/* PLACEHOLDER: Replace with your verified support email and address */}
            For privacy-related queries or to exercise your rights, contact:{"\n\n"}
            TaxPadi Ghana Limited{"\n"}
            Email: support@taxpadi.com{"\n"}
            [INSERT REGISTERED OFFICE ADDRESS], Ghana
          </P>
        </Section>

        <View style={styles.footer}>
          <Text style={styles.footerText}>TaxPadi Ghana Limited · Privacy Policy · v1.0</Text>
        </View>
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
    paddingBottom: 14,
  },

  headerTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#111827",
  },

  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 48,
  },

  lastUpdated: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
    marginBottom: 14,
  },

  introBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#FDECEC",
    borderRadius: 14,
    padding: 14,
    marginBottom: 24,
  },

  introText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#374151",
    lineHeight: 20,
  },

  section: {
    marginBottom: 22,
  },

  sectionTitle: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    marginBottom: 8,
  },

  body: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#374151",
    lineHeight: 21,
    marginBottom: 8,
  },

  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
    paddingLeft: 4,
  },

  bulletDot: {
    fontSize: 13,
    color: "#C44736",
    marginRight: 8,
    lineHeight: 21,
  },

  bulletText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#374151",
    lineHeight: 21,
  },

  footer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    alignItems: "center",
  },

  footerText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
  },
});

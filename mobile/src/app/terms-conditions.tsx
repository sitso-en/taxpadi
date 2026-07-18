// =============================================================================
// PLACEHOLDER LEGAL TEXT — This is a professionally drafted template for
// TaxPadi. REPLACE with your actual reviewed and solicitor-approved terms
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

export default function TermsConditionsScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.lastUpdated}>Last Updated: 17 July 2026</Text>

        <View style={styles.introBanner}>
          <Ionicons name="document-text-outline" size={20} color="#C44736" />
          <Text style={styles.introText}>
            Please read these Terms carefully. By creating an account or using TaxPadi, you agree to be bound by these Terms and Conditions.
          </Text>
        </View>

        <Section title="1. Acceptance of Terms">
          <P>
            These Terms and Conditions ("Terms") constitute a legally binding agreement between you ("User", "you") and TaxPadi Ghana Limited ("TaxPadi", "we", "us") governing your access to and use of the TaxPadi mobile application and associated services ("Service").
          </P>
          <P>
            By registering an account, ticking the acceptance checkbox, or using any part of the Service, you confirm that you have read, understood, and agree to these Terms. If you do not agree, you must not use TaxPadi.
          </P>
        </Section>

        <Section title="2. Eligibility">
          <P>You may use TaxPadi only if:</P>
          <Bullet>You are at least 18 years of age.</Bullet>
          <Bullet>You are a resident or tax-registered entity in the Republic of Ghana, or you file tax returns with the Ghana Revenue Authority (GRA).</Bullet>
          <Bullet>You have the legal capacity to enter into a binding contract under Ghanaian law.</Bullet>
          <Bullet>Your use does not violate any applicable law or regulation.</Bullet>
        </Section>

        <Section title="3. Description of Service">
          <P>
            TaxPadi provides digital tools to help you manage your tax obligations in Ghana, including but not limited to:
          </P>
          <Bullet>Recording and categorising financial transactions.</Bullet>
          <Bullet>Estimating income tax, VAT, PAYE, and withholding tax liabilities using current GRA rates.</Bullet>
          <Bullet>Generating draft tax returns for your review.</Bullet>
          <Bullet>Issuing invoices and managing receivables.</Bullet>
          <Bullet>Providing a Savings Vault to help you set aside funds for tax payments.</Bullet>
          <Bullet>Displaying tax deadlines and sending reminders.</Bullet>
          <Bullet>Offering access to third-party financial product referrals (insurance, loans) from partner institutions.</Bullet>
        </Section>

        <Section title="4. Tax Disclaimer — Important">
          <P>
            TaxPadi is a financial technology tool, NOT a licensed tax advisor, accountant, or tax agent. The calculations, estimates, and information provided by TaxPadi:
          </P>
          <Bullet>Are based on the tax rates and rules programmed into the system at the time of your use, which may not reflect the most recent GRA updates or gazette notices.</Bullet>
          <Bullet>Are estimates only and do not constitute formal tax advice.</Bullet>
          <Bullet>Are not a substitute for professional advice from a qualified tax professional or certified accountant.</Bullet>
          <P>
            You remain solely responsible for the accuracy of any tax return submitted to the GRA, for paying the correct amount of tax, and for complying with all obligations under Ghanaian tax law. TaxPadi accepts no liability for penalties, interest, or assessments arising from reliance on the Service.
          </P>
        </Section>

        <Section title="5. Account Registration and Security">
          <P>
            You must provide accurate, current, and complete information during registration, including your full legal name, phone number, and Ghana region. You are responsible for:
          </P>
          <Bullet>Maintaining the confidentiality of your password and any generated credentials.</Bullet>
          <Bullet>All activity that occurs under your account.</Bullet>
          <Bullet>Notifying us immediately at support@taxpadi.com if you suspect unauthorised access to your account.</Bullet>
          <P>
            We reserve the right to suspend or terminate accounts where we have reason to believe that the information provided is false, misleading, or that the account is being used for fraudulent purposes.
          </P>
        </Section>

        <Section title="6. User Responsibilities">
          <P>You agree that you will:</P>
          <Bullet>Use TaxPadi only for lawful purposes and in accordance with these Terms.</Bullet>
          <Bullet>Not attempt to access, tamper with, or disrupt TaxPadi's servers, databases, or security systems.</Bullet>
          <Bullet>Not use the Service to facilitate tax evasion, money laundering, fraud, or any other illegal activity.</Bullet>
          <Bullet>Not reverse-engineer, decompile, or create derivative works based on the TaxPadi application or its underlying systems.</Bullet>
          <Bullet>Not share your account credentials with third parties.</Bullet>
          <Bullet>Ensure that any employee or PAYE data you enter relates to individuals who have given appropriate consent.</Bullet>
        </Section>

        <Section title="7. Subscription Plans and Payment">
          <P>
            TaxPadi offers a free tier with limited features and paid subscription plans ("Pro" or "Annual") that unlock additional functionality. Subscription details, pricing (in Ghana Cedis, GHS), and features are described within the app and may change with 30 days' notice.
          </P>
          <Bullet>Payments are processed via Paystack and are subject to Paystack's terms of service.</Bullet>
          <Bullet>Subscriptions are non-refundable once activated, except where required by Ghanaian consumer protection law.</Bullet>
          <Bullet>TaxPadi may introduce promotional pricing or referral offers at its discretion. Referral offers are subject to partner terms and may require eligibility criteria to be met.</Bullet>
          <Bullet>We reserve the right to change subscription pricing with 30 days' notice. Existing active subscriptions will not be affected until renewal.</Bullet>
        </Section>

        <Section title="8. Intellectual Property">
          <P>
            All content, design, software, algorithms, branding, and materials in TaxPadi are the exclusive property of TaxPadi Ghana Limited or its licensors. These are protected by copyright, trade mark, and other intellectual property laws of Ghana and applicable international conventions.
          </P>
          <P>
            We grant you a limited, non-exclusive, non-transferable, revocable licence to use TaxPadi solely for your personal or business tax management purposes. No other rights are granted.
          </P>
        </Section>

        <Section title="9. Third-Party Services">
          <P>
            TaxPadi integrates with third-party services including Paystack (payments), Arkesel/Wigal (SMS), Firebase (push notifications), AWS S3 (document storage), and Anthropic Claude (TaxBot AI). Your use of these services is subject to their respective terms and privacy policies. TaxPadi is not responsible for the conduct or reliability of third-party services.
          </P>
        </Section>

        <Section title="10. Limitation of Liability">
          <P>
            To the fullest extent permitted by Ghanaian law, TaxPadi Ghana Limited, its directors, employees, and agents shall not be liable for:
          </P>
          <Bullet>Any indirect, incidental, special, or consequential loss or damage arising from your use of the Service.</Bullet>
          <Bullet>Any tax penalties, interest, surcharges, or assessments imposed by the GRA or any other authority.</Bullet>
          <Bullet>Loss of data, loss of profit, or loss of business arising from technical failures, service interruptions, or inaccurate tax calculations.</Bullet>
          <Bullet>Any actions or omissions of third-party service providers integrated with TaxPadi.</Bullet>
          <P>
            Our total aggregate liability to you for any claim arising from or related to the Service shall not exceed the amount you paid to TaxPadi in subscription fees in the three (3) months preceding the event giving rise to the claim.
          </P>
        </Section>

        <Section title="11. Service Availability">
          <P>
            We strive to maintain 99.5% uptime but do not guarantee uninterrupted access to TaxPadi. The Service may be temporarily unavailable due to scheduled maintenance, technical failures, or events beyond our control (force majeure). We are not liable for any loss caused by service downtime.
          </P>
        </Section>

        <Section title="12. Termination">
          <P>
            You may delete your account at any time from within the app or by contacting support@taxpadi.com. We reserve the right to suspend or terminate your access to TaxPadi without notice if:
          </P>
          <Bullet>You breach these Terms.</Bullet>
          <Bullet>We are required to do so by law or regulatory authority.</Bullet>
          <Bullet>We reasonably suspect fraudulent or abusive activity on your account.</Bullet>
          <P>
            Upon termination, your right to use the Service ceases immediately. We will retain your data in accordance with our Privacy Policy and applicable legal obligations.
          </P>
        </Section>

        <Section title="13. Governing Law and Disputes">
          <P>
            These Terms are governed by and construed in accordance with the laws of the Republic of Ghana. Any dispute arising from or relating to these Terms or the Service shall first be subject to good-faith negotiation. If unresolved within 30 days, disputes shall be referred to arbitration in Accra, Ghana under the rules of the Ghana Arbitration Centre, with proceedings conducted in English.
          </P>
        </Section>

        <Section title="14. Amendments">
          <P>
            We may amend these Terms at any time. We will notify you of material changes via in-app notification or email at least 14 days before the changes take effect. Continued use of TaxPadi after the effective date constitutes acceptance of the updated Terms. If you do not agree to the updated Terms, you must cease using the Service and may request account deletion.
          </P>
        </Section>

        <Section title="15. Entire Agreement">
          <P>
            These Terms, together with our Privacy Policy, constitute the entire agreement between you and TaxPadi Ghana Limited in relation to your use of the Service and supersede all prior agreements, representations, or understandings.
          </P>
        </Section>

        <Section title="16. Contact">
          <P>
            {/* PLACEHOLDER: Replace with your verified support email and address */}
            For questions about these Terms:{"\n\n"}
            TaxPadi Ghana Limited{"\n"}
            Email: support@taxpadi.com{"\n"}
            [INSERT REGISTERED OFFICE ADDRESS], Ghana
          </P>
        </Section>

        <View style={styles.footer}>
          <Text style={styles.footerText}>TaxPadi Ghana Limited · Terms & Conditions · v1.0</Text>
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

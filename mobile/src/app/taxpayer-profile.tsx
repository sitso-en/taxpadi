import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { getTaxProfile } from "../services/tax-profile.service";
import { formatCategory, getUserFriendlyError } from "@/utils/error";
import { useToast } from "@/context/ToastContext";

type TaxProfile = {
  full_name?: string;
  tin?: string;
  taxpayer_type?: string;
  region?: string;
  registration_date?: string;
  vat_registered?: boolean;
  vat_registration_no?: string;
  paye_registered?: boolean;
  nhil_registered?: boolean;
  tax_year_start?: string;
  onboarding_complete?: boolean;
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <>
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
    <View style={styles.divider} />
  </>
);

const StatusRow = ({
  label,
  active,
  activeLabel = "Registered",
  inactiveLabel = "Not Registered",
  last = false,
}: {
  label: string;
  active?: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
  last?: boolean;
}) => (
  <>
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.badge,
          { backgroundColor: active ? "#DCFCE7" : "#F3F4F6" },
        ]}
      >
        <Text
          style={[
            styles.badgeText,
            { color: active ? "#15803D" : "#6B7280" },
          ]}
        >
          {active ? activeLabel : inactiveLabel}
        </Text>
      </View>
    </View>
    {!last && <View style={styles.divider} />}
  </>
);

export default function TaxpayerProfileScreen() {
  const { showToast } = useToast();
  const [profile, setProfile] = useState<TaxProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await getTaxProfile();
      setProfile(res.data);
    } catch (error: any) {
      showToast(getUserFriendlyError(error), "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#C44736" />
      </View>
    );
  }

  const registrationDateFormatted = profile?.registration_date
    ? new Date(profile.registration_date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  const taxYearFormatted = profile?.tax_year_start
    ? new Date(profile.tax_year_start).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 48 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Taxpayer Profile</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={42} color="#FFFFFF" />
        </View>
        <Text style={styles.name}>
          {profile?.full_name ?? "My Profile"}
        </Text>
        <Text style={styles.tin}>
          TIN: {profile?.tin ?? "Not set"}
        </Text>
      </View>

      {/* Identity */}
      <View style={styles.infoCard}>
        <Row
          label="Taxpayer Type"
          value={formatCategory(profile?.taxpayer_type) ?? "—"}
        />
        <Row label="Region" value={profile?.region ?? "—"} />
        <Row label="Registered On" value={registrationDateFormatted} />
        <Row label="Tax Year Start" value={taxYearFormatted} />
        <StatusRow
          label="Onboarding"
          active={profile?.onboarding_complete}
          activeLabel="Complete"
          inactiveLabel="Incomplete"
          last
        />
      </View>

      {/* Tax Modules */}
      <Text style={styles.sectionHeading}>TAX MODULES</Text>
      <View style={styles.infoCard}>
        <StatusRow label="VAT" active={profile?.vat_registered} />
        {profile?.vat_registered && profile?.vat_registration_no ? (
          <>
            <Row label="VAT Reg. No." value={profile.vat_registration_no} />
          </>
        ) : null}
        <StatusRow label="PAYE" active={profile?.paye_registered} />
        <StatusRow label="NHIL" active={profile?.nhil_registered} last />
      </View>
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

  centered: {
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    color: "#111827",
    fontFamily: "Inter_700Bold",
    marginLeft: 10,
  },

  profileCard: {
    backgroundColor: "#C44736",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  name: {
    color: "#FFFFFF",
    fontSize: 24,
    fontFamily: "Inter_700Bold",
  },

  tin: {
    color: "#FDECEC",
    marginTop: 6,
    fontFamily: "Inter_500Medium",
  },

  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },

  divider: {
    height: 1,
    backgroundColor: "#EDE8E3",
  },

  label: {
    color: "#6B7280",
    fontFamily: "Inter_500Medium",
  },

  value: {
    color: "#111827",
    fontFamily: "Inter_600SemiBold",
    flex: 1,
    textAlign: "right",
    marginLeft: 16,
  },

  sectionHeading: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "#9CA3AF",
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 20,
  },

  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },

  badgeText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
});

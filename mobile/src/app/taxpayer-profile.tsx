import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import BottomSheet from "@/components/BottomSheet";
import { completeOnboarding, getTaxProfile, updateTaxProfile } from "../services/tax-profile.service";
import { updateMe } from "../services/user.service";
import { formatCategory, getUserFriendlyError } from "@/utils/error";
import { useToast } from "@/context/ToastContext";

// Keys MUST match the backend TaxpayerCategory enum (uppercase); /tax-profile GET
// returns taxpayer_type as the enum name, and /users/me expects the same values.
const TAXPAYER_TYPES = [
  { key: "INDIVIDUAL",     label: "Individual" },
  { key: "SOLE_TRADER",    label: "Sole Trader" },
  { key: "SMALL_BUSINESS", label: "Small Business" },
];

const GHANA_REGIONS = [
  "Greater Accra", "Ashanti", "Western", "Eastern", "Central",
  "Volta", "Northern", "Upper East", "Upper West",
  "Bono", "Bono East", "Ahafo", "Western North", "Oti", "Savannah", "North East",
];

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
  const [editVisible, setEditVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [editData, setEditData] = useState({
    tin: "",
    taxpayer_type: "",
    region: "",
    tax_year_start: "",
  });

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

  const openEdit = () => {
    const existingStart = profile?.tax_year_start
      ? new Date(profile.tax_year_start).toISOString().split("T")[0]
      : "";
    setEditData({
      tin: profile?.tin ?? "",
      taxpayer_type: profile?.taxpayer_type ?? "",
      region: profile?.region ?? "",
      tax_year_start: existingStart,
    });
    setEditVisible(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // TIN, region, and taxpayer category live on the user — /tax-profile ignores them.
      await updateMe({
        tin: editData.tin || undefined,
        region: editData.region || undefined,
        taxpayer_category: editData.taxpayer_type || undefined,
      });

      // Tax-year-start lives on the tax profile. Only send it if it ACTUALLY
      // changed — it can't be changed after onboarding, and resending the
      // unchanged value would 400 and silently block the rest of the save.
      const originalStart = profile?.tax_year_start
        ? new Date(profile.tax_year_start).toISOString().split("T")[0]
        : "";
      if (editData.tax_year_start && editData.tax_year_start !== originalStart) {
        await updateTaxProfile({ tax_year_start: editData.tax_year_start });
      }

      let onboardingComplete = profile?.onboarding_complete ?? false;
      if (!onboardingComplete && editData.tax_year_start) {
        try {
          await completeOnboarding({
            tax_year_start: editData.tax_year_start,
            ...(editData.tin ? { tin: editData.tin } : {}),
          });
          onboardingComplete = true;
        } catch {
          // non-fatal — deadlines not generated yet, profile still saved
        }
      }
      setProfile((prev) =>
        prev ? { ...prev, ...editData, onboarding_complete: onboardingComplete } : prev
      );
      setEditVisible(false);
      showToast("Profile updated.", "success");
    } catch (error: any) {
      showToast(getUserFriendlyError(error), "error");
    } finally {
      setSaving(false);
    }
  };

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
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Taxpayer Profile</Text>
        <TouchableOpacity onPress={openEdit} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="create-outline" size={22} color="#C44736" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={26} color="#FFFFFF" />
        </View>
        <View>
          <Text style={styles.name}>
            {profile?.full_name ?? "My Profile"}
          </Text>
          <Text style={styles.tin}>
            TIN: {profile?.tin ?? "Not set"}
          </Text>
        </View>
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

      <BottomSheet visible={editVisible} onClose={() => setEditVisible(false)} avoidKeyboard>
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Edit Profile</Text>

          {/* TIN */}
          <Text style={styles.fieldLabel}>TIN</Text>
          <TextInput
            style={styles.input}
            value={editData.tin}
            onChangeText={(v) => setEditData((p) => ({ ...p, tin: v }))}
            placeholder="e.g. C0012345678"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="characters"
          />

          {/* Taxpayer Type */}
          <Text style={styles.fieldLabel}>Taxpayer Type</Text>
          <View style={styles.chipRow}>
            {TAXPAYER_TYPES.map((t) => {
              const active = editData.taxpayer_type === t.key;
              return (
                <TouchableOpacity
                  key={t.key}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setEditData((p) => ({ ...p, taxpayer_type: t.key }))}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{t.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Region */}
          <Text style={styles.fieldLabel}>Region</Text>
          <View style={styles.chipRow}>
            {GHANA_REGIONS.map((r) => {
              const active = editData.region === r;
              return (
                <TouchableOpacity
                  key={r}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setEditData((p) => ({ ...p, region: r }))}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{r}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Tax Year Start */}
          <Text style={styles.fieldLabel}>Tax Year Start</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.8}
          >
            <Text style={[styles.dateButtonText, !editData.tax_year_start && { color: "#9CA3AF" }]}>
              {editData.tax_year_start
                ? new Date(editData.tax_year_start).toLocaleDateString("en-GB", {
                    day: "numeric", month: "short", year: "numeric",
                  })
                : "Select a date"}
            </Text>
            <Ionicons name="calendar-outline" size={18} color="#9CA3AF" />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={editData.tax_year_start ? new Date(editData.tax_year_start) : new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_, date) => {
                if (Platform.OS !== "ios") setShowDatePicker(false);
                if (date) {
                  setEditData((p) => ({ ...p, tax_year_start: date.toISOString().split("T")[0] }));
                }
              }}
            />
          )}
          {showDatePicker && Platform.OS === "ios" && (
            <TouchableOpacity onPress={() => setShowDatePicker(false)} style={styles.doneBtn}>
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            <Text style={styles.saveBtnText}>{saving ? "Saving…" : "Save Changes"}</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
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
    justifyContent: "space-between",
    marginBottom: 20,
  },

  title: {
    fontSize: 24,
    color: "#111827",
    fontFamily: "Inter_700Bold",
  },

  profileCard: {
    backgroundColor: "#C44736",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#C44736",
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  name: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.2,
  },

  tin: {
    color: "rgba(255,255,255,0.75)",
    marginTop: 4,
    fontFamily: "Inter_400Regular",
    fontSize: 13,
  },

  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#EFEFED",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
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

  // Edit sheet
  sheetContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  sheetTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: "#6B7280",
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#111827",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  chipActive: {
    backgroundColor: "#FDECEC",
    borderColor: "#C44736",
  },
  chipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#6B7280",
  },
  chipTextActive: {
    color: "#C44736",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  dateButtonText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#111827",
  },
  doneBtn: {
    alignSelf: "flex-end",
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 6,
  },
  doneBtnText: {
    color: "#C44736",
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  saveBtn: {
    backgroundColor: "#C44736",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
    shadowColor: "#C44736",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
});
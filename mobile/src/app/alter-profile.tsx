import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";

import { Dropdown } from "react-native-element-dropdown";
import { useUser } from "../context/UserContext";
import { updateMe } from "../services/user.service";
import { getUserFriendlyError, formatCategory } from "@/utils/error";
import { useToast } from "@/context/ToastContext";
import { useNetwork } from "@/context/NetworkContext";
import OfflineFormNotice from "@/components/OfflineFormNotice";

const countryCodes = [
  { label: "🇬🇭 +233", value: "+233" },
  { label: "🇺🇸 +1", value: "+1" },
  { label: "🇬🇧 +44", value: "+44" },
  { label: "🇳🇬 +234", value: "+234" },
];

const regions = [
  { label: "Ahafo Region", value: "Ahafo Region" },
  { label: "Ashanti Region", value: "Ashanti Region" },
  { label: "Bono Region", value: "Bono Region" },
  { label: "Bono East Region", value: "Bono East Region" },
  { label: "Central Region", value: "Central Region" },
  { label: "Eastern Region", value: "Eastern Region" },
  { label: "Greater Accra Region", value: "Greater Accra Region" },
  { label: "North East Region", value: "North East Region" },
  { label: "Northern Region", value: "Northern Region" },
  { label: "Oti Region", value: "Oti Region" },
  { label: "Savannah Region", value: "Savannah Region" },
  { label: "Upper East Region", value: "Upper East Region" },
  { label: "Upper West Region", value: "Upper West Region" },
  { label: "Volta Region", value: "Volta Region" },
  { label: "Western Region", value: "Western Region" },
  { label: "Western North Region", value: "Western North Region" },
];

const categories = [
  { label: "Individual", value: "INDIVIDUAL" },
  { label: "Sole Trader", value: "SOLE_TRADER" },
  { label: "Small Business", value: "SMALL_BUSINESS" },
];

const detectCountryCode = (phone: string) => {
  if (!phone) return "+233";
  if (phone.startsWith("+234")) return "+234";
  if (phone.startsWith("+233")) return "+233";
  if (phone.startsWith("+44")) return "+44";
  if (phone.startsWith("+1")) return "+1";
  return "+233";
};

const stripCountryCode = (phone: string, code: string) => {
  if (!phone) return "";
  if (phone.startsWith(code)) return phone.slice(code.length).trim();
  return phone;
};

export default function AlterProfileScreen() {
  const { user, updateUser } = useUser();
  const { showToast } = useToast();
  const { isOnline } = useNetwork();

  const detectedCode = detectCountryCode(user.phoneNumber);
  const strippedPhone = stripCountryCode(user.phoneNumber, detectedCode);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState(user.fullName ?? "");
  const [countryCode, setCountryCode] = useState(detectedCode);
  const [phoneNumber, setPhoneNumber] = useState(strippedPhone);
  const [email, setEmail] = useState(user.email ?? "");
  const [tin, setTin] = useState(user.tin ?? "");
  const [region, setRegion] = useState(user.region ?? "");
  const [category, setCategory] = useState(user.category ?? "");
  const [errors, setErrors] = useState<{ fullName?: string; email?: string }>({});

  const handleCancel = () => {
    // Reset all fields back to context values
    setFullName(user.fullName ?? "");
    setCountryCode(detectedCode);
    setPhoneNumber(strippedPhone);
    setEmail(user.email ?? "");
    setTin(user.tin ?? "");
    setRegion(user.region ?? "");
    setCategory(user.category ?? "");
    setErrors({});
    setIsEditing(false);
  };

  const saveProfile = async () => {
    if (!isOnline) {
      showToast("You're offline. Connect to save your profile.", "info");
      return;
    }
    const newErrors: typeof errors = {};
    if (!fullName?.trim()) newErrors.fullName = "Enter your full name.";
    if (!email?.trim()) newErrors.email = "Enter your email address.";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      const res = await updateMe({
        full_name: fullName,
        email,
        tin: tin.trim() || undefined,
        region,
        taxpayer_category: category || undefined,
      });

      const updated = res.data ?? {};
      const savedCategory = updated.taxpayer_category ?? category;
      updateUser({
        fullName: updated.full_name ?? fullName,
        email: updated.email ?? email,
        tin: updated.tin ?? tin,
        region: updated.region ?? region,
        category: savedCategory,
        taxpayer_category: savedCategory,
      });

      showToast("Profile updated successfully.", "success");
      setIsEditing(false);
    } catch (error: any) {
      showToast(getUserFriendlyError(error), "error");
    } finally {
      setSaving(false);
    }
  };

  const displayPhone = user.phoneNumber
    ? user.phoneNumber
    : "Not set";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 60 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <OfflineFormNotice />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        {!isEditing ? (
          <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditing(true)}>
            <Ionicons name="pencil-outline" size={18} color="#C44736" />
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Fields */}
      <Field label="FULL NAME" value={user.fullName || "—"} editing={isEditing}>
        <TextInput
          style={[styles.input, errors.fullName && styles.inputError]}
          value={fullName}
          onChangeText={(t) => { setFullName(t); if (errors.fullName) setErrors(e => ({ ...e, fullName: undefined })); }}
          placeholder="Full Name"
          placeholderTextColor="#9CA3AF"
        />
        {errors.fullName ? <Text style={styles.fieldError}>{errors.fullName}</Text> : null}
      </Field>

      <Field label="PHONE NUMBER" value={displayPhone} editing={isEditing}>
        <View style={styles.phoneContainer}>
          <Dropdown
            style={styles.countryDropdown}
            selectedTextStyle={styles.dropdownText}
            itemTextStyle={styles.dropdownText}
            containerStyle={styles.dropdownContainer}
            activeColor="#F2EDE8"
            iconColor="#9CA3AF"
            data={countryCodes}
            labelField="label"
            valueField="value"
            value={countryCode}
            onChange={(item) => setCountryCode(item.value)}
          />
          <TextInput
            style={styles.phoneInput}
            placeholder="24 123 4567"
            placeholderTextColor="#9CA3AF"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={(text) => {
              const cleaned = text.replace(/\D/g, "");
              let formatted = cleaned;
              if (cleaned.length > 2) {
                formatted = cleaned.replace(
                  /(\d{2})(\d{0,3})(\d{0,4})/,
                  (_, p1, p2, p3) => [p1, p2, p3].filter(Boolean).join(" ")
                );
              }
              setPhoneNumber(formatted);
            }}
          />
        </View>
      </Field>

      <Field label="EMAIL ADDRESS" value={user.email || "—"} editing={isEditing}>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          value={email}
          onChangeText={(t) => { setEmail(t); if (errors.email) setErrors(e => ({ ...e, email: undefined })); }}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="Email Address"
          placeholderTextColor="#9CA3AF"
        />
        {errors.email ? <Text style={styles.fieldError}>{errors.email}</Text> : null}
      </Field>

      <Field label="TIN (TAX IDENTIFICATION NUMBER)" value={user.tin || "Not assigned"} editing={isEditing}>
        <TextInput
          style={styles.input}
          value={tin}
          onChangeText={setTin}
          placeholder="e.g. C0012345678"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="characters"
        />
      </Field>

      <Field label="REGION" value={user.region || "—"} editing={isEditing}>
        <Dropdown
          style={styles.dropdown}
          data={regions}
          labelField="label"
          valueField="value"
          value={region}
          placeholder="Select Region"
          placeholderStyle={styles.dropdownPlaceholder}
          selectedTextStyle={styles.dropdownText}
          itemTextStyle={styles.dropdownText}
          containerStyle={styles.dropdownContainer}
          activeColor="#F2EDE8"
          iconColor="#9CA3AF"
          onChange={(item) => setRegion(item.value)}
        />
      </Field>

      <Field label="TAXPAYER CATEGORY" value={formatCategory(user.category)} editing={isEditing}>
        <Dropdown
          style={styles.dropdown}
          data={categories}
          labelField="label"
          valueField="value"
          value={category}
          placeholder="Select Category"
          placeholderStyle={styles.dropdownPlaceholder}
          selectedTextStyle={styles.dropdownText}
          itemTextStyle={styles.dropdownText}
          containerStyle={styles.dropdownContainer}
          activeColor="#F2EDE8"
          iconColor="#9CA3AF"
          onChange={(item) => setCategory(item.value)}
        />
      </Field>

      {isEditing && (
        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.7 }]}
          onPress={saveProfile}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveBtnText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

function Field({
  label,
  value,
  editing,
  children,
}: {
  label: string;
  value: string;
  editing: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.label}>{label}</Text>
      {editing ? children : <Text style={styles.readValue}>{value}</Text>}
    </View>
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
    marginBottom: 30,
  },
  title: {
    flex: 1,
    fontSize: 24,
    marginLeft: 12,
    color: "#111827",
    fontFamily: "Inter_700Bold",
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF5F3",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "#F8C5BF",
    gap: 5,
  },
  editBtnText: {
    color: "#C44736",
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  cancelText: {
    color: "#6B7280",
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
  fieldWrapper: {
    marginBottom: 20,
  },
  label: {
    color: "#C44736",
    fontSize: 10,
    marginBottom: 8,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.4,
  },
  readValue: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#ECECEC",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#111827",
    ...(Platform.OS === "web" ? { outlineWidth: 0 } : {}),
  },
  phoneContainer: {
    flexDirection: "row",
  },
  countryDropdown: {
    width: 115,
    height: 56,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 10,
    marginRight: 8,
  },
  phoneInput: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 56,
    color: "#111827",
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    ...(Platform.OS === "web" ? { outlineWidth: 0 } : {}),
  },
  dropdown: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 56,
  },
  dropdownText: {
    color: "#111827",
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  dropdownPlaceholder: {
    color: "#9CA3AF",
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  dropdownContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    overflow: "hidden",
    marginTop: 2,
  },
  saveBtn: {
    backgroundColor: "#C44736",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  fieldError: {
    color: "#EF4444",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },
  inputError: {
    borderWidth: 1.5,
    borderColor: "#EF4444",
  },
});

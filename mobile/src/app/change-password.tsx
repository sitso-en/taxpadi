import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import axios from "axios";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { changePassword } from "@/services/user.service";
import { useToast } from "@/context/ToastContext";
import { getUserFriendlyError } from "@/utils/error";

function PasswordField({
  label, value, onChange, show, onToggle, error, placeholder,
}: {
  label: string; value: string; onChange: (t: string) => void;
  show: boolean; onToggle: () => void; error?: string; placeholder: string;
}) {
  return (
    <View style={{ marginBottom: error ? 4 : 16 }}>
      <Text style={fieldStyles.fieldLabel}>{label}</Text>
      <View style={[fieldStyles.fieldRow, error ? fieldStyles.fieldError : null]}>
        <TextInput
          style={fieldStyles.fieldInput}
          value={value}
          onChangeText={onChange}
          secureTextEntry={!show}
          placeholder={placeholder}
          placeholderTextColor="#6B7280"
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={onToggle} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name={show ? "eye-off-outline" : "eye-outline"} size={18} color="#6B7280" />
        </TouchableOpacity>
      </View>
      {error ? <Text style={fieldStyles.errorText}>{error}</Text> : null}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  fieldLabel: {
    color: "#C44736",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  fieldError: {
    borderColor: "#EF4444",
  },
  fieldInput: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#111827",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
    marginBottom: 12,
  },
});

export default function ChangePasswordScreen() {
  const { showToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!currentPassword) e.current = "Enter your current password.";
    if (!newPassword || newPassword.length < 8) e.new = "Password must be at least 8 characters.";
    if (newPassword !== confirmPassword) e.confirm = "Passwords do not match.";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSaving(true);
    setErrors({});
    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      showToast("Password changed. Other sessions have been logged out.", "success");
      router.back();
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const low = ((error.response?.data?.message ?? "") as string).toLowerCase();
        // Wrong current password belongs under the current-password field, not a
        // generic "password requirements" toast.
        if (low.includes("current password is incorrect")) {
          setErrors((prev) => ({ ...prev, current: "Current password is incorrect." }));
          return;
        }
        if (low.includes("do not match")) {
          setErrors((prev) => ({ ...prev, confirm: "Passwords do not match." }));
          return;
        }
      }
      showToast(getUserFriendlyError(error), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F2EDE8" }}
      behavior="padding"
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="chevron-back" size={26} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.title}>Change Password</Text>
          <View style={{ width: 26 }} />
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="lock-closed-outline" size={18} color="#6B7280" />
          <Text style={styles.infoText}>
            Changing your password will log out all other active sessions on other devices.
          </Text>
        </View>

        <PasswordField
          label="CURRENT PASSWORD"
          value={currentPassword}
          onChange={(t) => { setCurrentPassword(t); if (errors.current) setErrors((e) => ({ ...e, current: undefined })); }}
          show={showCurrent}
          onToggle={() => setShowCurrent((v) => !v)}
          error={errors.current}
          placeholder="Enter current password"
        />
        <PasswordField
          label="NEW PASSWORD"
          value={newPassword}
          onChange={(t) => { setNewPassword(t); if (errors.new) setErrors((e) => ({ ...e, new: undefined })); }}
          show={showNew}
          onToggle={() => setShowNew((v) => !v)}
          error={errors.new}
          placeholder="At least 8 characters"
        />
        <PasswordField
          label="CONFIRM NEW PASSWORD"
          value={confirmPassword}
          onChange={(t) => { setConfirmPassword(t); if (errors.confirm) setErrors((e) => ({ ...e, confirm: undefined })); }}
          show={showConfirm}
          onToggle={() => setShowConfirm((v) => !v)}
          error={errors.confirm}
          placeholder="Re-enter new password"
        />

        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>{saving ? "Saving…" : "Change Password"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 48,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  title: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#111827",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 24,
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
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
    marginBottom: 12,
  },
  saveBtn: {
    backgroundColor: "#C44736",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
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
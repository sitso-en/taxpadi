import { Ionicons } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";
import React, { useState } from "react";
import ConfirmModal from "@/components/ConfirmModal";
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
import { deactivateAccount } from "@/services/user.service";
import { useToast } from "@/context/ToastContext";
import { getUserFriendlyError } from "@/utils/error";

const REASONS = [
  "I no longer need this service",
  "I'm switching to another app",
  "Privacy concerns",
  "Too expensive",
  "Other",
];

export default function DeactivateAccountScreen() {
  const { showToast } = useToast();
  const navigation = useNavigation();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [reason, setReason] = useState("");
  const [selectedReason, setSelectedReason] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const resetToLogin = () =>
    (navigation as any).reset({ index: 0, routes: [{ name: "login" }] });

  const handleContinue = () => {
    if (!password) {
      setPasswordError("Enter your password to confirm.");
      return;
    }
    setPasswordError("");
    setShowConfirm(true);
  };

  const handleDeactivate = async () => {
    setShowConfirm(false);
    setDeactivating(true);
    try {
      const finalReason =
        selectedReason === "Other" ? reason : selectedReason || undefined;
      await deactivateAccount({ password, reason: finalReason });
      showToast("Account deactivated. You have been logged out.", "success");
      resetToLogin();
    } catch (error: any) {
      showToast(getUserFriendlyError(error), "error");
    } finally {
      setDeactivating(false);
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-back" size={26} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.title}>Deactivate Account</Text>
          <View style={{ width: 26 }} />
        </View>

        {/* Warning banner */}
        <View style={styles.warningCard}>
          <View style={styles.warningIconBox}>
            <Ionicons name="warning-outline" size={22} color="#DC2626" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.warningTitle}>This action is serious</Text>
            <Text style={styles.warningText}>
              Deactivating your account will immediately revoke your access.
              Your data will be retained for{" "}
              <Text style={{ fontFamily: "Inter_600SemiBold", color: "#111827" }}>
                6 years
              </Text>{" "}
              as required by the Ghana Revenue Authority (GRA) and the Data
              Protection Act 2012 (Act 843). You can request reactivation during
              this period.
            </Text>
          </View>
        </View>

        {/* Consequences list */}
        <View style={styles.consequencesCard}>
          <Text style={styles.consequencesTitle}>What happens when you deactivate:</Text>
          {[
            "You will be logged out of all devices immediately",
            "You cannot log back in unless reactivated",
            "Your tax records and documents are retained by law",
            "Active subscriptions will not be refunded",
          ].map((item) => (
            <View key={item} style={styles.consequenceRow}>
              <Ionicons name="close-circle-outline" size={16} color="#DC2626" style={{ marginTop: 1 }} />
              <Text style={styles.consequenceText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Reason (optional) */}
        <Text style={styles.label}>REASON (OPTIONAL)</Text>
        <View style={styles.reasonGrid}>
          {REASONS.map((r) => (
            <TouchableOpacity
              key={r}
              style={[
                styles.reasonChip,
                selectedReason === r && styles.reasonChipSelected,
              ]}
              onPress={() =>
                setSelectedReason((prev) => (prev === r ? "" : r))
              }
            >
              <Text
                style={[
                  styles.reasonChipText,
                  selectedReason === r && styles.reasonChipTextSelected,
                ]}
              >
                {r}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedReason === "Other" && (
          <TextInput
            style={styles.otherInput}
            placeholder="Tell us more…"
            placeholderTextColor="#6B7280"
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        )}

        {/* Password confirmation */}
        <Text style={[styles.label, { marginTop: 20 }]}>
          CONFIRM WITH YOUR PASSWORD
        </Text>
        <View
          style={[
            styles.fieldRow,
            passwordError ? styles.fieldError : null,
          ]}
        >
          <TextInput
            style={styles.fieldInput}
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              if (t) setPasswordError("");
            }}
            secureTextEntry={!showPassword}
            placeholder="Enter your password"
            placeholderTextColor="#6B7280"
            autoCapitalize="none"
          />
          <TouchableOpacity
            onPress={() => setShowPassword((v) => !v)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={18}
              color="#9CA3AF"
            />
          </TouchableOpacity>
        </View>
        {passwordError ? (
          <Text style={styles.errorText}>{passwordError}</Text>
        ) : null}

        {/* Deactivate button */}
        <TouchableOpacity
          style={[styles.deactivateBtn, deactivating && { opacity: 0.7 }]}
          onPress={handleContinue}
          disabled={deactivating}
        >
          <Ionicons name="trash-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.deactivateBtnText}>
            {deactivating ? "Deactivating…" : "Deactivate My Account"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => router.back()}
          disabled={deactivating}
        >
          <Text style={styles.cancelBtnText}>Cancel — Keep My Account</Text>
        </TouchableOpacity>
      </ScrollView>

      <ConfirmModal
        visible={showConfirm}
        onClose={() => setShowConfirm(false)}
        iconName="warning"
        iconColor="#DC2626"
        title="Are you absolutely sure?"
        message="You are about to deactivate your TaxPadi account. This will log you out of all devices immediately."
        cancelLabel="Go Back"
        confirmLabel="Yes, Deactivate"
        onConfirm={handleDeactivate}
      />
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
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#111827",
  },

  warningCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "#FEF2F2",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  warningIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  warningTitle: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: "#991B1B",
    marginBottom: 6,
  },
  warningText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#7F1D1D",
    lineHeight: 19,
  },

  consequencesCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  consequencesTitle: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#111827",
    marginBottom: 12,
  },
  consequenceRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 8,
  },
  consequenceText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#374151",
    lineHeight: 18,
  },

  label: {
    color: "#C44736",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
    marginBottom: 10,
  },

  reasonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  reasonChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#EDE8E3",
    borderWidth: 1,
    borderColor: "transparent",
  },
  reasonChipSelected: {
    backgroundColor: "#FEE2E2",
    borderColor: "#FECACA",
  },
  reasonChipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#6B7280",
  },
  reasonChipTextSelected: {
    color: "#DC2626",
    fontFamily: "Inter_600SemiBold",
  },

  otherInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#111827",
    minHeight: 80,
    marginBottom: 4,
    borderWidth: 1.5,
    borderColor: "transparent",
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
    marginBottom: 4,
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
    marginBottom: 8,
  },

  deactivateBtn: {
    backgroundColor: "#DC2626",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 20,
    shadowColor: "#DC2626",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  deactivateBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },

  cancelBtn: {
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  cancelBtnText: {
    color: "#6B7280",
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    alignItems: "center",
  },
  modalIconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  modalText: {
    color: "#6B7280",
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 22,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#EDE8E3",
    alignItems: "center",
  },
  modalCancelText: {
    fontFamily: "Inter_600SemiBold",
    color: "#111827",
    fontSize: 14,
  },
  modalConfirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#DC2626",
    alignItems: "center",
  },
  modalConfirmText: {
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
});

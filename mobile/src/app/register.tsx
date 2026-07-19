import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { getUserFriendlyError } from "@/utils/error";
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import BottomSheet from "@/components/BottomSheet";
import { useAuthAnimation } from "@/hooks/useAuthAnimation";
import { AuthArcs } from "@/components/AuthArcs";
import { Dropdown } from "react-native-element-dropdown";

import * as Clipboard from "expo-clipboard";

import { register } from "@/services/auth.service";
import { useToast } from "@/context/ToastContext";

const regions = [
  { label: "Greater Accra", value: "Greater Accra" },
  { label: "Ashanti", value: "Ashanti" },
  { label: "Central", value: "Central" },
  { label: "Eastern", value: "Eastern" },
  { label: "Northern", value: "Northern" },
  { label: "Western", value: "Western" },
  { label: "Volta", value: "Volta" },
  { label: "Upper East", value: "Upper East" },
  { label: "Upper West", value: "Upper West" },
  { label: "Bono", value: "Bono" },
  { label: "Ahafo", value: "Ahafo" },
  { label: "Bono East", value: "Bono East" },
  { label: "Oti", value: "Oti" },
  { label: "Savannah", value: "Savannah" },
  { label: "North East", value: "North East" },
  { label: "Western North", value: "Western North" },
];

const countryCodes = [
  { label: "🇬🇭 +233", value: "+233" },
  { label: "🇺🇸 +1", value: "+1" },
  { label: "🇬🇧 +44", value: "+44" },
  { label: "🇳🇬 +234", value: "+234" },
  { label: "🇿🇦 +27", value: "+27" },
  { label: "🇰🇪 +254", value: "+254" },
];

const taxpayerCategories = [
  { label: "Individual", value: "INDIVIDUAL" },
  { label: "Sole Trader", value: "SOLE_TRADER" },
  { label: "Small Business", value: "SMALL_BUSINESS" },
];

const CHARSET =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%&";

function generatePassword(): string {
  return Array.from(
    { length: 12 },
    () => CHARSET[Math.floor(Math.random() * CHARSET.length)]
  ).join("");
}

export default function RegisterScreen() {
  const { logoScale, logoOpacity, items } = useAuthAnimation(2);

  const [step, setStep] = useState(1);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+233");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [region, setRegion] = useState("Greater Accra");
  const [category, setCategory] = useState("INDIVIDUAL");
  const [showPassword, setShowPassword] = useState(false);
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{fullName?: string; phone?: string; password?: string; email?: string}>({});
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);

  const handleNext = () => {
    if (step === 1) {
      const cleanedPhone = phoneNumber.replace(/\s/g, "").replace(/\D/g, "");
      const newErrors: typeof errors = {};
      if (!fullName.trim()) newErrors.fullName = "Enter your full name.";
      if (!phoneNumber.trim()) {
        newErrors.phone = "Enter your phone number.";
      } else if (cleanedPhone.length !== 9) {
        newErrors.phone = "Enter a valid Ghana phone number.";
      }
      if (!password.trim()) {
        newErrors.password = "Enter a password.";
      } else if (password.length < 8) {
        newErrors.password = "Password must be at least 8 characters.";
      }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = "Enter a valid email address.";
      }
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      setErrors({});
    }

    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleRegister = async () => {
    if (loading) return;

    try {
      setLoading(true);

      const cleanedPhone = phoneNumber.replace(/\D/g, "");

      const fullPhone =
        countryCode === "+233"
          ? `0${cleanedPhone}`
          : `${countryCode}${cleanedPhone}`;

      const response = await register({
        full_name: fullName,
        phone: fullPhone,
        email: email || undefined,
        password,
        region,
        taxpayer_category: category,
      });

      if (!response.success) {
        showToast(response.message, "error");
        return;
      }

      router.push({
        pathname: "/otp-verification",
        params: {
          phone: fullPhone,
          purpose: "REGISTER",
        },
      });
    } catch (error: any) {
      showToast(getUserFriendlyError(error), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#FFFFFF" }}
      behavior="padding"
    >
      <AuthArcs />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.Image
          source={require("@/assets/images/logoA4.png")}
          style={[
            styles.logo,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
          resizeMode="contain"
        />

        <Animated.View
          style={{
            opacity: items[0].opacity,
            transform: [{ translateY: items[0].translateY }],
          }}
        >
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>
          Step {step} of 3 • Join thousands of Ghanaians managing their taxes smarter.
        </Text>

        <View style={styles.progressContainer}>
          {[1, 2, 3].map((item) => (
            <View
              key={item}
              style={[styles.progressDot, step >= item && styles.activeProgressDot]}
            />
          ))}
        </View>
        </Animated.View>

        <Animated.View
          style={{
            opacity: items[1].opacity,
            transform: [{ translateY: items[1].translateY }],
          }}
        >
        {step === 1 && (
          <>
            <Text style={styles.label}>FULL NAME</Text>
            <TextInput
              style={[styles.input, errors.fullName && styles.inputError, !!errors.fullName && { marginBottom: 4 }]}
              placeholder="e.g. Chris Mensah"
              placeholderTextColor="#6B7280"
              value={fullName}
              onChangeText={(text) => { setFullName(text); if (errors.fullName) setErrors(e => ({ ...e, fullName: undefined })); }}
            />
            {errors.fullName ? <Text style={styles.fieldError}>{errors.fullName}</Text> : null}

            <Text style={styles.label}>PHONE</Text>
            <View style={styles.phoneContainer}>
              <Dropdown
                style={styles.countryDropdown}
                placeholderStyle={styles.dropdownPlaceholder}
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
                style={[styles.phoneInput, errors.phone && styles.inputError]}
                placeholder="24 123 4567"
                placeholderTextColor="#6B7280"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={(text) => {
                  const cleaned = text.replace(/\D/g, "");
                  let formatted = cleaned;

                  if (cleaned.length > 2) {
                    formatted = cleaned.replace(/(\d{2})(\d{0,3})(\d{0,4})/, (_, p1, p2, p3) =>
                      [p1, p2, p3].filter(Boolean).join(" ")
                    );
                  }

                  setPhoneNumber(formatted);
                  if (errors.phone) setErrors(e => ({ ...e, phone: undefined }));
                }}
              />
            </View>
            {errors.phone ? <Text style={styles.fieldError}>{errors.phone}</Text> : null}

            <Text style={styles.label}>EMAIL</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError, !!errors.email && { marginBottom: 4 }]}
              placeholder="you@email.com"
              placeholderTextColor="#6B7280"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(text) => { setEmail(text); if (errors.email) setErrors(e => ({ ...e, email: undefined })); }}
            />
            {errors.email ? <Text style={styles.fieldError}>{errors.email}</Text> : null}

            <View style={styles.labelRow}>
              <Text style={styles.label}>PASSWORD</Text>
              <TouchableOpacity
                onPress={() => {
                  const pw = generatePassword();
                  setPassword(pw);
                  setShowPassword(true);
                  setCopied(false);
                  setGeneratedPassword(pw);
                  if (errors.password) setErrors(e => ({ ...e, password: undefined }));
                }}
              >
                <Text style={styles.generateLink}>Generate</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.passwordContainer, errors.password && styles.inputError]}>
              <TextInput
                style={styles.passwordInput}
                placeholder="••••••••"
                placeholderTextColor="#6B7280"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(text) => { setPassword(text); if (errors.password) setErrors(e => ({ ...e, password: undefined })); }}
              />

              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>
            {errors.password ? <Text style={styles.fieldError}>{errors.password}</Text> : null}

            <TouchableOpacity style={[styles.button, { marginTop: 28 }]} onPress={handleNext}>
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 2 && (
          <>
            <Text style={styles.label}>REGION</Text>
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.dropdownPlaceholder}
              selectedTextStyle={styles.dropdownText}
              itemTextStyle={styles.dropdownText}
              containerStyle={styles.dropdownContainer}
              activeColor="#F2EDE8"
              iconColor="#9CA3AF"
              data={regions}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder="Select Region"
              value={region}
              onChange={(item) => setRegion(item.value)}
            />

            <Text style={styles.label}>TAXPAYER CATEGORY</Text>
            <View style={styles.categoryContainer}>
              {taxpayerCategories.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.categoryButton,
                    category === item.value && styles.selectedCategory,
                  ]}
                  onPress={() => setCategory(item.value)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      category === item.value && styles.selectedCategoryText,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.secondaryButton} onPress={handleBack}>
                <Text style={styles.secondaryButtonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={handleNext}>
                <Text style={styles.buttonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {step === 3 && (
          <>
            <View style={styles.reviewCard}>
              <Text style={styles.reviewTitle}>Review your details</Text>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Full name</Text>
                <Text style={styles.reviewValue}>{fullName || "Not provided"}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Phone</Text>
                <Text style={styles.reviewValue}>{countryCode} {phoneNumber || "Not provided"}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Email</Text>
                <Text style={styles.reviewValue}>{email || "Not provided"}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Region</Text>
                <Text style={styles.reviewValue}>{region}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Category</Text>
                <Text style={styles.reviewValue}>
                  {taxpayerCategories.find((c) => c.value === category)?.label || category}
                </Text>
              </View>
            </View>

            {/* Legal consent checkboxes */}
            <TouchableOpacity
              style={styles.checkRow}
              onPress={() => setAgreedPrivacy((v) => !v)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, agreedPrivacy && styles.checkboxChecked]}>
                {agreedPrivacy && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
              </View>
              <Text style={styles.checkLabel}>
                I have read and agree to the{" "}
                <Text
                  style={styles.checkLink}
                  onPress={() => router.push("/privacy-policy")}
                >
                  Privacy Policy
                </Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.checkRow, { marginBottom: 20 }]}
              onPress={() => setAgreedTerms((v) => !v)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, agreedTerms && styles.checkboxChecked]}>
                {agreedTerms && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
              </View>
              <Text style={styles.checkLabel}>
                I have read and agree to the{" "}
                <Text
                  style={styles.checkLink}
                  onPress={() => router.push("/terms-conditions")}
                >
                  Terms & Conditions
                </Text>
              </Text>
            </TouchableOpacity>

            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.secondaryButton} onPress={handleBack}>
                <Text style={styles.secondaryButtonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, (loading || !agreedPrivacy || !agreedTerms) && { opacity: 0.5 }]}
                onPress={handleRegister}
                disabled={!agreedPrivacy || !agreedTerms}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Create Account</Text>
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => router.replace("/login")}>
              <Text style={styles.loginText}>Already have an account? Log In</Text>
            </TouchableOpacity>
          </>
        )}
        </Animated.View>
      </ScrollView>

      {/* Generated password modal */}
      <BottomSheet visible={generatedPassword !== null} onClose={() => setGeneratedPassword(null)}>
        <View style={styles.sheetContent}>

          <View style={styles.modalHeaderRow}>
            <View style={styles.modalIconBox}>
              <Ionicons name="key-outline" size={20} color="#C44736" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.modalTitle}>Generated Password</Text>
              <Text style={styles.modalHint}>Save this before you continue</Text>
            </View>
          </View>

          <View style={styles.passwordDisplay}>
            <Text style={styles.passwordText} selectable>
              {generatedPassword}
            </Text>
            <TouchableOpacity
              style={styles.copyInline}
              onPress={async () => {
                if (generatedPassword) {
                  await Clipboard.setStringAsync(generatedPassword);
                  setCopied(true);
                }
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name={copied ? "checkmark-circle" : "copy-outline"}
                size={20}
                color={copied ? "#10B981" : "#C44736"}
              />
            </TouchableOpacity>
          </View>

          {copied && (
            <Text style={styles.copiedLabel}>Copied to clipboard</Text>
          )}

          <TouchableOpacity
            style={styles.savedButton}
            onPress={() => setGeneratedPassword(null)}
          >
            <Text style={styles.savedButtonText}>Done, I've saved it</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2EDE8",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 44,
    paddingBottom: 40,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    color: "#111827",
    fontFamily: "Inter_700Bold",
    marginBottom: 6,
  },
  subtitle: {
    color: "#6B7280",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 16,
  },
  progressContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  progressDot: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
  },
  activeProgressDot: {
    backgroundColor: "#C44736",
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    marginTop: 8,
  },
  label: {
    fontSize: 11,
    color: "#C44736",
    fontFamily: "Inter_600SemiBold",
    marginBottom: 8,
    marginTop: 8,
  },
  generateLink: {
    fontSize: 12,
    color: "#C44736",
    fontFamily: "Inter_600SemiBold",
  },
  input: {
    backgroundColor: "#EDE8E3",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 8,
    fontFamily: "Inter_400Regular",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EDE8E3",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 16,
    fontFamily: "Inter_400Regular",
    ...(Platform.OS === "web" ? { outlineWidth: 0 } : {}),
  },
  dropdown: {
    height: 56,
    backgroundColor: "#EDE8E3",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  dropdownPlaceholder: {
    color: "#9CA3AF",
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  dropdownText: {
    color: "#111827",
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
  categoryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
    gap: 8,
  },
  categoryButton: {
    flex: 1,
    backgroundColor: "#ECECEC",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  selectedCategory: {
    backgroundColor: "#C44736",
  },
  categoryText: {
    fontSize: 12,
    color: "#111827",
    fontFamily: "Inter_500Medium",
  },
  selectedCategoryText: {
    color: "#FFFFFF",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    backgroundColor: "#C44736",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#EDE8E3",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  secondaryButtonText: {
    color: "#111827",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  loginText: {
    textAlign: "center",
    marginTop: 18,
    marginBottom: 40,
    color: "#6B7280",
    fontFamily: "Inter_400Regular",
  },
  phoneContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  countryDropdown: {
    width: 115,
    height: 56,
    backgroundColor: "#EDE8E3",
    borderRadius: 12,
    paddingHorizontal: 10,
    marginRight: 8,
  },
  phoneInput: {
    flex: 1,
    backgroundColor: "#EDE8E3",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 56,
    fontFamily: "Inter_400Regular",
    ...(Platform.OS === "web" ? { outlineWidth: 0 } : {}),
  },
  reviewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  reviewTitle: {
    fontSize: 18,
    color: "#111827",
    fontFamily: "Inter_700Bold",
    marginBottom: 12,
  },
  reviewRow: {
    marginBottom: 10,
  },
  reviewLabel: {
    color: "#6B7280",
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    marginBottom: 2,
  },
  reviewValue: {
    color: "#111827",
    fontFamily: "Inter_600SemiBold",
  },
  fieldError: {
    color: "#EF4444",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
    marginBottom: 8,
  },
  inputError: {
    borderWidth: 1.5,
    borderColor: "#EF4444",
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: "#C44736",
    borderColor: "#C44736",
  },
  checkLabel: {
    flex: 1,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#374151",
    lineHeight: 20,
  },
  checkLink: {
    color: "#C44736",
    fontFamily: "Inter_600SemiBold",
    textDecorationLine: "underline",
  },
  sheetContent: {
    paddingHorizontal: 24,
    paddingBottom: 36,
  },
  modalHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  modalIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FDECEC",
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#111827",
  },
  modalHint: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
    marginTop: 2,
  },
  passwordDisplay: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  passwordText: {
    flex: 1,
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    letterSpacing: 1.2,
  },
  copyInline: {
    padding: 4,
  },
  copiedLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "#10B981",
    marginBottom: 16,
    marginLeft: 4,
  },
  savedButton: {
    backgroundColor: "#C44736",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#C44736",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  savedButtonText: {
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
});
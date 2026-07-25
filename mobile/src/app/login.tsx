import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import axios from "axios";
import * as LocalAuthentication from "expo-local-authentication";
import React, { useEffect, useRef, useState } from "react";
import { getUserFriendlyError } from "@/utils/error";
import {
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthAnimation } from "@/hooks/useAuthAnimation";
import { Dropdown } from "react-native-element-dropdown";

import { login, biometricLogin } from "@/services/auth.service";
import { getMe } from "@/services/user.service";
import { isBiometricEnabled, getBiometricToken, setOnboarded } from "@/utils/storage";
import { useToast } from "@/context/ToastContext";
import { useTransactions } from "@/context/TransactionContext";
import { usePayments } from "@/context/PaymentContext";
import { useUser } from "@/context/UserContext";
import { usePrivacy } from "@/context/PrivacyContext";
import { useSubscription } from "@/context/SubscriptionContext";
import { getDeviceInfo } from "@/utils/device";

const countryCodes = [
  { label: "🇬🇭 +233", value: "+233" },
  { label: "🇺🇸 +1", value: "+1" },
  { label: "🇬🇧 +44", value: "+44" },
  { label: "🇳🇬 +234", value: "+234" },
  { label: "🇿🇦 +27", value: "+27" },
  { label: "🇰🇪 +254", value: "+254" },
];

export default function LoginScreen() {
  const { logoScale, logoOpacity, items } = useAuthAnimation(2);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+233");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ phone?: string; password?: string }>({});
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  const { showToast } = useToast();
  const { refreshTransactions } = useTransactions();
  const { refreshPayments } = usePayments();
  const { setUser } = useUser();
  const { resetPrivacy } = usePrivacy();
  const { refresh: refreshSubscription } = useSubscription();

  useEffect(() => {
    LocalAuthentication.hasHardwareAsync().then(async (has) => {
      if (!has) return;
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!enrolled) return;
      const enabled = await isBiometricEnabled();
      if (!enabled) return;
      setBiometricAvailable(true);
    }).catch(() => {});
  }, []);

  const scrollRef = useRef<ScrollView>(null);

  const scrollToBottom = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300);
  };

  const handleBiometricLogin = async () => {
    if (loading) return;
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Sign in to TaxPadi",
        cancelLabel: "Cancel",
      });
      if (!result.success) return;

      const token = await getBiometricToken();
      if (!token) {
        showToast("Biometric login is not set up. Please sign in with your password.", "info");
        setBiometricAvailable(false);
        return;
      }

      setLoading(true);
      const response = await biometricLogin(token, getDeviceInfo());
      if (!response.success) {
        showToast(response.message, "error");
        return;
      }

      const profileRes = await getMe();
      const profile = profileRes.data ?? profileRes;
      setUser({
        fullName: profile.full_name ?? response.data.user.full_name ?? "",
        phoneNumber: profile.phone ?? response.data.user.phone ?? "",
        email: profile.email ?? "",
        tin: profile.tin ?? "",
        region: profile.region ?? "",
        category: profile.taxpayer_category ?? "",
        subscription_tier: profile.subscription_tier ?? response.data.user.subscription_tier ?? "FREE",
        is_active: profile.is_active ?? true,
        is_verified: profile.is_verified ?? false,
        label: "",
        taxpayer_category: profile.taxpayer_category ?? "",
        active_profile: profile.is_active ?? false,
      });
      setOnboarded();
      resetPrivacy();
      await Promise.all([refreshTransactions(), refreshPayments(), refreshSubscription()]);
      router.replace("/(tabs)/dashboard");
    } catch (error: any) {
      showToast(getUserFriendlyError(error), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (loading) return;

    let cleanedPhone = phoneNumber.replace(/\s/g, "");
    if (cleanedPhone.startsWith("0")) cleanedPhone = cleanedPhone.slice(1);

    const newErrors: { phone?: string; password?: string } = {};
    if (!cleanedPhone) {
      newErrors.phone = "Enter your phone number.";
    } else if (cleanedPhone.length !== 9) {
      newErrors.phone = "Enter a valid 9-digit phone number.";
    }
    if (!password.trim()) newErrors.password = "Enter your password.";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const fullPhone = `0${cleanedPhone}`;
      const response = await login(fullPhone, password, getDeviceInfo());

      if (!response.success) {
        showToast(response.message, "error");
        return;
      }

      const profileRes = await getMe();
      const profile = profileRes.data ?? profileRes;

      setUser({
        fullName: profile.full_name ?? response.data.user.full_name ?? "",
        phoneNumber: profile.phone ?? response.data.user.phone ?? "",
        email: profile.email ?? "",
        tin: profile.tin ?? "",
        region: profile.region ?? "",
        category: profile.taxpayer_category ?? "",
        subscription_tier: profile.subscription_tier ?? response.data.user.subscription_tier ?? "FREE",
        is_active: profile.is_active ?? true,
        is_verified: profile.is_verified ?? false,
        label: "",
        taxpayer_category: profile.taxpayer_category ?? "",
        active_profile: profile.is_active ?? false,
      });

      setOnboarded();
      resetPrivacy();
      await Promise.all([refreshTransactions(), refreshPayments(), refreshSubscription()]);
      router.replace("/(tabs)/dashboard");
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const raw = (error.response?.data?.message ?? "") as string;
        const low = raw.toLowerCase();

        // Wrong password: attribute it to the password field, not the phone number.
        // Show the server's message verbatim so the "You have N attempt(s) left"
        // countdown reaches the user.
        if (status === 400 && low.includes("invalid phone number or password")) {
          setErrors({ password: raw || "Incorrect phone number or password. Please try again." });
          return;
        }
        // No account exists for that number — that's genuinely a phone-field problem.
        if (status === 404 && low.includes("no account")) {
          setErrors({ phone: "No account found for this phone number." });
          return;
        }
        // Account-status messages (locked / unverified / deactivated) are account-level,
        // not field errors — surface the server's own wording as a toast.
        if (
          status === 400 &&
          (low.includes("locked") || low.includes("not verified") || low.includes("deactivated"))
        ) {
          showToast(raw, low.includes("not verified") ? "info" : "error");
          return;
        }
      }
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
      <SafeAreaView style={styles.safe} edges={["top"]}>
        {/* ── Hero section ── */}
        <LinearGradient
          colors={["#C44736", "#8B2318"]}
          style={styles.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Decorative arcs in hero */}
          <View style={styles.arcOuter} pointerEvents="none" />
          <View style={styles.arcInner} pointerEvents="none" />

          <Animated.View
            style={[
              styles.heroContent,
              { opacity: logoOpacity, transform: [{ scale: logoScale }] },
            ]}
          >
            <View style={styles.logoRow}>
              <Image
                source={require("@/assets/images/symbol.png")}
                style={styles.logoSymbol}
                resizeMode="contain"
                tintColor="#FFFFFF"
              />
              <View style={styles.logoText}>
                <Image
                  source={require("@/assets/images/tax.png")}
                  style={styles.logoTax}
                  resizeMode="contain"
                  tintColor="#FFFFFF"
                />
                <Image
                  source={require("@/assets/images/padi.png")}
                  style={styles.logoPadi}
                  resizeMode="contain"
                  tintColor="#FFFFFF"
                />
              </View>
            </View>
            <Text style={styles.heroTitle}>Welcome Back</Text>
            <Text style={styles.heroSubtitle}>Sign in to your TaxPadi account</Text>
          </Animated.View>
        </LinearGradient>

        {/* ── Form sheet ── */}
        <ScrollView
          ref={scrollRef}
          style={styles.sheet}
          contentContainerStyle={styles.sheetContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={{
              opacity: items[0].opacity,
              transform: [{ translateY: items[0].translateY }],
            }}
          >
            {/* Phone */}
            <Text style={styles.fieldLabel}>PHONE NUMBER</Text>
            <View style={[styles.phoneRow, errors.phone && styles.inputError]}>
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
                  const formatted =
                    cleaned.length > 2
                      ? cleaned.replace(
                          /(\d{2})(\d{0,3})(\d{0,4})/,
                          (_, p1, p2, p3) => [p1, p2, p3].filter(Boolean).join(" ")
                        )
                      : cleaned;
                  setPhoneNumber(formatted);
                  if (errors.phone) setErrors((e) => ({ ...e, phone: undefined }));
                }}
              />
            </View>
            {errors.phone ? <Text style={styles.fieldError}>{errors.phone}</Text> : null}

            {/* Password */}
            <Text style={styles.fieldLabel}>PASSWORD</Text>
            <View style={[styles.inputRow, errors.password && styles.inputError]}>
              <TextInput
                style={styles.textInput}
                placeholder="••••••••"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
                value={password}
                onFocus={scrollToBottom}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors((e) => ({ ...e, password: undefined }));
                }}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>
            {errors.password ? <Text style={styles.fieldError}>{errors.password}</Text> : null}
          </Animated.View>

          <Animated.View
            style={{
              opacity: items[1].opacity,
              transform: [{ translateY: items[1].translateY }],
            }}
          >
            <TouchableOpacity
              onPress={() => router.push("/forgot-password")}
              style={styles.forgotRow}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginBtn, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              activeOpacity={0.88}
            >
              {loading ? (
                <Text style={styles.loginBtnText}>Signing in...</Text>
              ) : (
                <Text style={styles.loginBtnText}>Log In</Text>
              )}
            </TouchableOpacity>

            {biometricAvailable && (
              <TouchableOpacity
                style={[styles.biometricBtn, loading && { opacity: 0.5 }]}
                onPress={handleBiometricLogin}
                activeOpacity={0.8}
                disabled={loading}
              >
                <Ionicons
                  name="finger-print"
                  size={22}
                  color="#6B7280"
                />
                <Text style={styles.biometricBtnText}>Sign in with Biometrics</Text>
              </TouchableOpacity>
            )}

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerLabel}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.registerBtn}
              onPress={() => router.push("/register")}
              activeOpacity={0.75}
            >
              <Text style={styles.registerBtnText}>Create an account</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#C44736",
  },

  root: {
    flex: 1,
  },

  // ── Hero ──
  hero: {
    flex: 0.42,
    justifyContent: "flex-end",
    paddingBottom: 40,
    paddingHorizontal: 28,
    overflow: "hidden",
  },

  arcOuter: {
    position: "absolute",
    top: -80,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.12)",
  },

  arcInner: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.08)",
  },

  heroContent: {
    gap: 6,
  },

  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },

  logoText: {
    flexDirection: "row",
    alignItems: "center",
  },

  logoSymbol: {
    width: 54,
    height: 54,
  },

  logoTax: {
    width: 80,
    height: 52,
    marginLeft: -12
  },

  logoPadi: {
    width: 150,
    height: 52,
    marginLeft: -35,
  },

  heroTitle: {
    fontSize: 34,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },

  heroSubtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.7)",
  },

  // ── Form sheet ──
  sheet: {
    flex: 1,
    backgroundColor: "#F2EDE8",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -28,
    overflow: "hidden",
  },

  sheetContent: {
    padding: 28,
    paddingTop: 32,
    paddingBottom: 40,
  },

  fieldLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "#C44736",
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 20,
  },

  phoneRow: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "transparent",
  },

  countryDropdown: {
    width: 115,
    height: 54,
    paddingHorizontal: 10,
    borderRightWidth: 1,
    borderRightColor: "#EDE8E3",
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

  phoneInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 16,
    fontFamily: "Inter_400Regular",
    color: "#111827",
    fontSize: 15,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: "transparent",
  },

  textInput: {
    flex: 1,
    paddingVertical: 16,
    fontFamily: "Inter_400Regular",
    color: "#111827",
    fontSize: 15,
  },

  eyeBtn: {
    paddingLeft: 10,
  },

  inputError: {
    borderColor: "#EF4444",
  },

  fieldError: {
    color: "#EF4444",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 6,
  },

  forgotRow: {
    alignSelf: "flex-end",
    marginTop: 12,
    marginBottom: 28,
  },

  forgotText: {
    color: "#C44736",
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },

  loginBtn: {
    backgroundColor: "#C44736",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: "#C44736",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },

  loginBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.1,
  },

  biometricBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 14,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },

  biometricBtnText: {
    color: "#6B7280",
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
    gap: 12,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#DDD7D0",
  },

  dividerLabel: {
    color: "#9CA3AF",
    fontFamily: "Inter_400Regular",
    fontSize: 13,
  },

  registerBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(17,24,39,0.12)",
    backgroundColor: "transparent",
  },

  registerBtnText: {
    color: "#111827",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
});
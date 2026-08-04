import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { getUserFriendlyError } from "@/utils/error";
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuthAnimation } from "@/hooks/useAuthAnimation";
import { AuthArcs } from "@/components/AuthArcs";

import {
  resendOTP,
  verifyOTP,
  verifyResetOTP,
} from "@/services/auth.service";
import { getMe } from "@/services/user.service";
import { setOnboarded } from "@/utils/storage";
import { useToast } from "@/context/ToastContext";
import { useUser } from "@/context/UserContext";
import { usePrivacy } from "@/context/PrivacyContext";
import { useTransactions } from "@/context/TransactionContext";
import { usePayments } from "@/context/PaymentContext";
import { useSubscription } from "@/context/SubscriptionContext";
import { useTaxLiability } from "@/context/TaxLiabilityContext";
import { useDeadlines } from "@/context/DeadlineContext";
import { useSavings } from "@/context/SavingsContext";
import { useTaxReturns } from "@/context/TaxReturnsContext";
import { useInvoices } from "@/context/InvoiceContext";
import { useCertificates } from "@/context/CertificateContext";
import { useNotifications } from "@/context/NotificationContext";
import { getDeviceInfo } from "@/utils/device";

// Must not be shorter than the backend's OTP_RESEND_COOLDOWN_SECONDS
// (AuthService.java), or the button re-enables early and the resend 429s.
const RESEND_COOLDOWN_SECONDS = 60;

export default function OTPVerificationScreen() {
  const { logoScale, logoOpacity, items } = useAuthAnimation(3);

  const { phone, purpose } = useLocalSearchParams<{
    phone: string;
    purpose: string;
  }>();

  const { showToast } = useToast();
  const { setUser } = useUser();
  const { resetPrivacy } = usePrivacy();
  const { refreshTransactions } = useTransactions();
  const { refreshPayments } = usePayments();
  const { refresh: refreshSubscription } = useSubscription();
  const { refreshLiability } = useTaxLiability();
  const { refreshDeadlines } = useDeadlines();
  const { refreshVault } = useSavings();
  const { refreshReturns } = useTaxReturns();
  const { refreshInvoices } = useInvoices();
  const { refreshCertificates } = useCertificates();
  const { refreshUnreadCount } = useNotifications();
  const [otp, setOtp] = useState("");
  const [seconds, setSeconds] = useState(RESEND_COOLDOWN_SECONDS);
  const [loading, setLoading] = useState(false);
  const [otpError, setOtpError] = useState("");

  useEffect(() => {
    if (seconds === 0) return;

    const timer = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  const handleVerify = async () => {
    if (!otp.trim()) {
      setOtpError("Enter the OTP.");
      return;
    }

    if (otp.length !== 6) {
      setOtpError("OTP must be 6 digits.");
      return;
    }

    if (loading) return;

    try {
      setLoading(true);

      if (purpose === "PASSWORD_RESET") {
        const response = await verifyResetOTP(
          phone,
          otp
        );

        if (!response.success || !response.data?.reset_token) {
          showToast(
            response.message ?? "Could not verify that code. Please try again.",
            "error"
          );
          return;
        }

        router.replace({
          pathname: "/reset-password",
          params: {
            resetToken:
              response.data.reset_token,
          },
        });

        return;
      }

      const response = await verifyOTP(
        phone,
        otp,
        purpose,
        getDeviceInfo()
      );

      if (!response.success) {
        showToast(response.message, "error");
        return;
      }

      if (purpose === "REGISTER") {
        // Populate the user + app state BEFORE landing on the dashboard, so a fresh
        // signup shows the same personalised data as a normal login — not the
        // "Good morning, User" placeholder with an empty profile. Mirrors the
        // population done in login.tsx handleLogin.
        const profileRes = await getMe();
        const profile = profileRes.data ?? profileRes;

        setUser({
          fullName: profile.full_name ?? response.data?.user?.full_name ?? "",
          phoneNumber: profile.phone ?? response.data?.user?.phone ?? "",
          email: profile.email ?? "",
          tin: profile.tin ?? "",
          region: profile.region ?? "",
          category: profile.taxpayer_category ?? "",
          subscription_tier: profile.subscription_tier ?? response.data?.user?.subscription_tier ?? "FREE",
          is_active: profile.is_active ?? true,
          is_verified: profile.is_verified ?? false,
          label: "",
          taxpayer_category: profile.taxpayer_category ?? "",
          active_profile: profile.is_active ?? false,
        });

        setOnboarded();
        resetPrivacy();
        await Promise.all([refreshTransactions(), refreshPayments(), refreshSubscription()]);
        // Warm the mount-once contexts so nothing shows empty on first landing.
        refreshLiability(false);
        refreshDeadlines(false);
        refreshVault(false);
        refreshReturns();
        refreshInvoices(false);
        refreshCertificates();
        refreshUnreadCount();

        showToast("Welcome to TaxPadi!", "success");
        router.replace("/(tabs)/dashboard");
        return;
      }

      if (purpose === "LOGIN") {
        showToast("Sign-in verified.", "success");
        router.back();
        return;
      }
    } catch (error: any) {
      showToast(getUserFriendlyError(error), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (seconds > 0) {
      showToast(`Please wait ${seconds}s before resending.`, "info");
      return;
    }
    try {
      await resendOTP(
        phone,
        purpose
      );
      setSeconds(RESEND_COOLDOWN_SECONDS);
      showToast("A new verification code has been sent.", "success");
    } catch (error: any) {
      showToast(getUserFriendlyError(error), "error");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons
          name="arrow-back"
          size={24}
          color="#111827"
        />
      </TouchableOpacity>

      <AuthArcs />

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
        <Text style={styles.title}>
          Verify OTP
        </Text>

        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to your
          phone.
        </Text>
      </Animated.View>

      <Animated.View
        style={{
          opacity: items[1].opacity,
          transform: [{ translateY: items[1].translateY }],
        }}
      >
        <Text style={styles.label}>
          ENTER OTP
        </Text>

        <TextInput
          style={[styles.input, otpError ? styles.inputError : undefined]}
          placeholder="123456"
          placeholderTextColor="#9CA3AF"
          keyboardType="number-pad"
          maxLength={6}
          value={otp}
          onChangeText={(text) => { setOtp(text); if (otpError) setOtpError(""); }}
        />
        {otpError ? <Text style={styles.fieldError}>{otpError}</Text> : null}

        <Text style={styles.timerText}>
          {seconds > 0
            ? `Resend code in ${Math.floor(seconds / 60)}:${(seconds % 60)
                .toString()
                .padStart(2, "0")}`
            : "You can now resend the code"}
        </Text>
      </Animated.View>

      <Animated.View
        style={{
          opacity: items[2].opacity,
          transform: [{ translateY: items[2].translateY }],
        }}
      >
        <TouchableOpacity
          style={[
            styles.button,
            loading && { opacity: 0.7 },
          ]}
          onPress={handleVerify}
        >
          <Text style={styles.buttonText}>
            {loading ? "Verifying..." : "Verify OTP"}
          </Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Didn't receive anything?
          </Text>

          <TouchableOpacity
            onPress={handleResendOTP}
          >
            <Text
              style={[
                styles.resend,
                {
                  opacity:
                    seconds > 0 ? 0.5 : 1,
                },
              ]}
            >
              Resend OTP
            </Text>
          </TouchableOpacity>

          <View
            style={styles.infoContainer}
          >
            <Ionicons
              name="information-circle-outline"
              size={16}
              color="#C44736"
            />

            <Text style={styles.infoText}>
              If you can't find the OTP,
              check your SMS messages.
            </Text>
          </View>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2EDE8",
    paddingHorizontal: 24,
    justifyContent: "center",
  },

  backButton: {
    position: "absolute",
    top: 44,
    left: 16,
    zIndex: 1,
  },

  logo: {
    width: 64,
    height: 64,
    alignSelf: "center",
    marginBottom: 24,
  },

  title: {
    fontSize: 32,
    color: "#111827",
    fontFamily: "Inter_700Bold",
    marginBottom: 8,
  },

  subtitle: {
    color: "#6B7280",
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 40,
    fontFamily: "Inter_400Regular",
  },

  label: {
    color: "#C44736",
    fontSize: 11,
    marginBottom: 8,
    fontFamily: "Inter_600SemiBold",
  },

  input: {
    backgroundColor: "#EDE8E3",
    borderRadius: 12,
    paddingVertical: 18,
    textAlign: "center",
    fontSize: 28,
    letterSpacing: 10,
    color: "#111827",
    fontFamily: "Inter_700Bold",
  },

  timerText: {
    textAlign: "center",
    marginTop: 16,
    color: "#6B7280",
    fontFamily: "Inter_400Regular",
    marginBottom: 32,
  },

  button: {
    backgroundColor: "#C44736",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },

  footer: {
    alignItems: "center",
    marginTop: 32,
  },

  footerText: {
    color: "#6B7280",
    fontFamily: "Inter_400Regular",
  },

  resend: {
    marginTop: 8,
    color: "#C44736",
    fontFamily: "Inter_600SemiBold",
  },

  infoContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    marginTop: 18,
    paddingHorizontal: 20,
  },

  infoText: {
    flex: 1,
    marginLeft: 6,
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    fontFamily: "Inter_400Regular",
  },
  fieldError: {
    color: "#EF4444",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 6,
    textAlign: "center",
  },
  inputError: {
    borderWidth: 1.5,
    borderColor: "#EF4444",
  },
});
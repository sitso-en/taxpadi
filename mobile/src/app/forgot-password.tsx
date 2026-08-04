import { forgotPassword } from "@/services/auth.service";
import { router } from "expo-router";
import React, { useState } from "react";
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
} from "react-native";
import { useAuthAnimation } from "@/hooks/useAuthAnimation";
import { AuthArcs } from "@/components/AuthArcs";
import { useToast } from "@/context/ToastContext";

export default function ForgotPasswordScreen() {
  const { logoScale, logoOpacity, items } = useAuthAnimation(3);
  const { showToast } = useToast();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  const handleSendCode = async () => {
    // Accept the number with or without its leading 0 — the placeholder shows
    // "024 123 4567", so most people type all 10 digits. Mirrors login.tsx.
    let cleanedPhone = phone.replace(/\D/g, "");
    if (cleanedPhone.startsWith("0")) cleanedPhone = cleanedPhone.slice(1);

    if (!phone.trim()) {
      setPhoneError("Enter your phone number.");
      return;
    }

    if (cleanedPhone.length !== 9) {
      setPhoneError("Enter a valid phone number.");
      return;
    }

    if (loading) return;

    try {
      setLoading(true);

      const fullPhone = `0${cleanedPhone}`;

      const response = await forgotPassword(fullPhone);

      if (!response.success) {
        showToast(response.message, "error");
        return;
      }

      showToast("OTP sent. Enter it below.", "success");
      router.push({
        pathname: "/otp-verification",
        params: {
          phone: fullPhone,
          purpose: "PASSWORD_RESET",
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
      style={styles.container}
      behavior="padding"
    >
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
        <Text style={styles.title}>Forgot Password</Text>

        <Text style={styles.subtitle}>
          Enter your phone number to receive a reset code.
        </Text>
      </Animated.View>

      <Animated.View
        style={{
          opacity: items[1].opacity,
          transform: [{ translateY: items[1].translateY }],
        }}
      >
        <TextInput
          style={[styles.input, phoneError ? styles.inputError : undefined, phoneError ? { marginBottom: 4 } : undefined]}
          placeholder="024 123 4567"
          placeholderTextColor="#6B7280"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={(text) => {
            const hasLeadingZero = text.replace(/\D/g, "").startsWith("0");

            // Group as 024 123 4567 or 24 123 4567 depending on whether the
            // user typed the leading 0, and cap at a full Ghanaian number.
            const cleaned = text
              .replace(/\D/g, "")
              .slice(0, hasLeadingZero ? 10 : 9);

            let formatted = cleaned;

            if (cleaned.length > (hasLeadingZero ? 3 : 2)) {
              formatted = cleaned.replace(
                hasLeadingZero
                  ? /(\d{3})(\d{0,3})(\d{0,4})/
                  : /(\d{2})(\d{0,3})(\d{0,4})/,
                (_, p1, p2, p3) =>
                  [p1, p2, p3].filter(Boolean).join(" ")
              );
            }

            setPhone(formatted);
            if (phoneError) setPhoneError("");
          }}
        />
        {phoneError ? <Text style={styles.fieldError}>{phoneError}</Text> : null}
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
          onPress={handleSendCode}
        >
          <Text style={styles.buttonText}>
            {loading ? "Sending..." : "Send OTP"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace("/login")}
        >
          <Text style={styles.link}>
            Back to Login
          </Text>
        </TouchableOpacity>
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

  logo: {
    width: 64,
    height: 64,
    alignSelf: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    color: "#111827",
  },

  subtitle: {
    textAlign: "center",
    color: "#6B7280",
    marginTop: 10,
    marginBottom: 30,
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    lineHeight: 24,
  },

  input: {
    backgroundColor: "#EDE8E3",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 20,
    color: "#111827",
    fontFamily: "Inter_400Regular",
    fontSize: 16,

    ...(Platform.OS === "web"
      ? {
          outlineWidth: 0,
        }
      : {}),
  },

  button: {
    backgroundColor: "#C44736",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
  },

  link: {
    textAlign: "center",
    marginTop: 20,
    color: "#C44736",
    fontFamily: "Inter_500Medium",
  },
  fieldError: {
    color: "#EF4444",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
    marginBottom: 8,
  },
  inputError: {
    borderWidth: 1.5,
    borderColor: "#EF4444",
  },
});
import { forgotPassword } from "@/services/auth.service";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";

export default function ForgotPasswordScreen() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!phone.trim()) {
      Alert.alert("Validation", "Enter your phone number.");
      return;
    }

    const cleanedPhone = phone.replace(/\D/g, "");

    if (cleanedPhone.length !== 9) {
      Alert.alert("Validation", "Enter a valid Ghana phone number.");
      return;
    }

    if (loading) return;

    try {
      setLoading(true);

      const fullPhone = `0${cleanedPhone}`;

      const response = await forgotPassword(fullPhone);

      if (!response.success) {
        Alert.alert("Failed", response.message);
        return;
      }

      router.push({
        pathname: "/otp-verification",
        params: {
          phone: fullPhone,
          purpose: "PASSWORD_RESET",
        },
      });
    } catch (error: any) {
      Alert.alert(
        "Request Failed",
        error?.response?.data?.message ??
          "Unable to send OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Text style={styles.title}>Forgot Password</Text>

      <Text style={styles.subtitle}>
        Enter your phone number to receive a reset code.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="24 123 4567"
        placeholderTextColor="#6B7280"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={(text) => {
          const cleaned = text.replace(/\D/g, "");

          let formatted = cleaned;

          if (cleaned.length > 2) {
            formatted = cleaned.replace(
              /(\d{2})(\d{0,3})(\d{0,4})/,
              (_, p1, p2, p3) =>
                [p1, p2, p3].filter(Boolean).join(" ")
            );
          }

          setPhone(formatted);
        }}
      />

      <TouchableOpacity
        style={[
          styles.button,
          loading && { opacity: 0.7 },
        ]}
        disabled={loading}
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    padding: 16,
    justifyContent: "center",
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
    backgroundColor: "#F1F5F9",
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
});
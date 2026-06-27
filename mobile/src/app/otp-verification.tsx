import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function OTPVerificationScreen() {
  const [otp, setOtp] = useState("");
  const [seconds, setSeconds] = useState(42);

  useEffect(() => {
    if (seconds === 0) return;

    const timer = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  const handleVerify = () => {
    router.replace("/dashboard");
  };

  const handleResendOTP = () => {
    setSeconds(42);

    Alert.alert(
      "OTP Sent",
      "A new verification code has been sent to your email."
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color="#111827" />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>Verify Your Email</Text>

      <Text style={styles.subtitle}>
        We sent a 6-digit code to your email address.
      </Text>

      {/* OTP Input */}
      <Text style={styles.label}>ENTER OTP</Text>

      <TextInput
        style={styles.input}
        placeholder="123456"
        placeholderTextColor="#9CA3AF"
        keyboardType="numeric"
        maxLength={6}
        value={otp}
        onChangeText={setOtp}
      />

      {/* Timer */}
      <Text style={styles.timerText}>
        {seconds > 0
          ? `Resend code in 0:${seconds
              .toString()
              .padStart(2, "0")}`
          : "You can now resend the code"}
      </Text>

      {/* Verify Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleVerify}
      >
        <Text style={styles.buttonText}>Verify</Text>
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Didn't receive anything?
        </Text>

        <TouchableOpacity
          onPress={handleResendOTP}
          disabled={seconds > 0}
        >
          <Text
            style={[
              styles.resend,
              {
                opacity: seconds > 0 ? 0.5 : 1,
              },
            ]}
          >
            Resend OTP
          </Text>
        </TouchableOpacity>

        {/* Spam Reminder */}
        <View style={styles.infoContainer}>
          <Ionicons
            name="information-circle-outline"
            size={16}
            color="#C44736"
          />
          <Text style={styles.infoText}>
            Can't find the email? Check your Spam or Junk folder.
          </Text>
        </View>
      </View>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 24,
    paddingTop: 70,
  },

  backButton: {
    marginBottom: 40,
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
    backgroundColor: "#F3F4F6",
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
});
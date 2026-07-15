import { resetPassword } from "@/services/auth.service";
import { getUserFriendlyError } from "@/utils/error";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
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

export default function ResetPasswordScreen() {
  const { resetToken } = useLocalSearchParams<{
    resetToken: string;
  }>();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!resetToken) {
      Alert.alert(
        "Invalid Request",
        "Your password reset session has expired. Please request another OTP."
      );

      router.replace("/forgot-password");
      return;
    }

    if (!newPassword.trim()) {
      Alert.alert(
        "Validation",
        "Enter a new password."
      );
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert(
        "Validation",
        "Password must be at least 8 characters."
      );
      return;
    }

    if (!confirmPassword.trim()) {
      Alert.alert(
        "Validation",
        "Please confirm your password."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(
        "Validation",
        "Passwords do not match."
      );
      return;
    }

    if (loading) return;

    setLoading(true);

    try {
      const response = await resetPassword(
        resetToken,
        newPassword,
        confirmPassword
      );

      if (!response.success) {
        Alert.alert(
          "Reset Failed",
          response.message
        );
        return;
      }

      Alert.alert(
        "Success",
        "Password reset successfully.",
        [
          {
            text: "Login",
            onPress: () =>
              router.replace("/login"),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
    "Password Reset Unsuccessful",
    getUserFriendlyError(error)
  );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : "height"
      }
    >
      <Text style={styles.title}>
        Create New Password
      </Text>

      <Text style={styles.subtitle}>
        Enter your new password below.
      </Text>

      <Text style={styles.label}>
        NEW PASSWORD
      </Text>

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="••••••••"
          placeholderTextColor="#6B7280"
          secureTextEntry={!showNewPassword}
          value={newPassword}
          onChangeText={setNewPassword}
        />

        <TouchableOpacity
          onPress={() =>
            setShowNewPassword(
              !showNewPassword
            )
          }
        >
          <Ionicons
            name={
              showNewPassword
                ? "eye-off-outline"
                : "eye-outline"
            }
            size={22}
            color="#6B7280"
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>
        CONFIRM PASSWORD
      </Text>

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="••••••••"
          placeholderTextColor="#6B7280"
          secureTextEntry={
            !showConfirmPassword
          }
          value={confirmPassword}
          onChangeText={
            setConfirmPassword
          }
        />

        <TouchableOpacity
          onPress={() =>
            setShowConfirmPassword(
              !showConfirmPassword
            )
          }
        >
          <Ionicons
            name={
              showConfirmPassword
                ? "eye-off-outline"
                : "eye-outline"
            }
            size={22}
            color="#6B7280"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          loading && { opacity: 0.7 },
        ]}
        disabled={loading}
        onPress={handleResetPassword}
      >
        <Text style={styles.buttonText}>
          {loading ? "Resetting..." : "Reset Password"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() =>
          router.replace("/login")
        }
      >
        <Text style={styles.backText}>
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
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  title: {
    fontSize: 30,
    color: "#111827",
    fontFamily: "Inter_700Bold",
    marginBottom: 8,
    textAlign: "center",
  },

  subtitle: {
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 30,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },

  label: {
    color: "#C44736",
    fontSize: 11,
    marginBottom: 8,
    marginTop: 12,
    fontFamily: "Inter_600SemiBold",
  },

  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 16,
  },

  passwordInput: {
    flex: 1,
    paddingVertical: 16,
    fontFamily: "Inter_400Regular",

    ...(Platform.OS === "web"
      ? {
          outlineWidth: 0,
        }
      : {}),
  },

  button: {
    backgroundColor: "#C44736",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 30,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },

  backText: {
    marginTop: 24,
    textAlign: "center",
    color: "#C44736",
    fontFamily: "Inter_500Medium",
  },
});
import { resetPassword } from "@/services/auth.service";
import { getUserFriendlyError } from "@/utils/error";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
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
import { useToast } from "@/context/ToastContext";

export default function ResetPasswordScreen() {
  const { logoScale, logoOpacity, items } = useAuthAnimation(3);

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

  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{newPassword?: string; confirmPassword?: string}>({});

  const handleResetPassword = async () => {
    if (!resetToken) {
      showToast("Your password reset session has expired.", "error");
      router.replace("/forgot-password");
      return;
    }

    const newErrors: {newPassword?: string; confirmPassword?: string} = {};
    if (!newPassword.trim()) {
      newErrors.newPassword = "Enter a new password.";
    } else if (newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters.";
    }
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
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
        showToast(response.message, "error");
        return;
      }

      showToast("Password reset successfully.", "success");
      router.replace("/login");
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
        <Text style={styles.title}>
          Create New Password
        </Text>

        <Text style={styles.subtitle}>
          Enter your new password below.
        </Text>
      </Animated.View>

      <Animated.View
        style={{
          opacity: items[1].opacity,
          transform: [{ translateY: items[1].translateY }],
        }}
      >
        <Text style={styles.label}>
          NEW PASSWORD
        </Text>

        <View style={[styles.passwordContainer, errors.newPassword && styles.inputError]}>
          <TextInput
            style={styles.passwordInput}
            placeholder="••••••••"
            placeholderTextColor="#6B7280"
            secureTextEntry={!showNewPassword}
            value={newPassword}
            onChangeText={(text) => { setNewPassword(text); if (errors.newPassword) setErrors(e => ({ ...e, newPassword: undefined })); }}
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
        {errors.newPassword ? <Text style={styles.fieldError}>{errors.newPassword}</Text> : null}

        <Text style={styles.label}>
          CONFIRM PASSWORD
        </Text>

        <View style={[styles.passwordContainer, errors.confirmPassword && styles.inputError]}>
          <TextInput
            style={styles.passwordInput}
            placeholder="••••••••"
            placeholderTextColor="#6B7280"
            secureTextEntry={
              !showConfirmPassword
            }
            value={confirmPassword}
            onChangeText={(text) => { setConfirmPassword(text); if (errors.confirmPassword) setErrors(e => ({ ...e, confirmPassword: undefined })); }}
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
        {errors.confirmPassword ? <Text style={styles.fieldError}>{errors.confirmPassword}</Text> : null}
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
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2EDE8",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  logo: {
    width: 64,
    height: 64,
    alignSelf: "center",
    marginBottom: 20,
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
    backgroundColor: "#EDE8E3",
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
  fieldError: {
    color: "#EF4444",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
    marginBottom: 4,
  },
  inputError: {
    borderWidth: 1.5,
    borderColor: "#EF4444",
  },
});
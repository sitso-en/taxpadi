import { Ionicons } from "@expo/vector-icons";
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
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";

import { login } from "@/services/auth.service";
import { useTransactions } from "@/context/TransactionContext";
import { usePayments } from "@/context/PaymentContext";
import { useUser, type User } from "@/context/UserContext";
import { getDeviceInfo } from "@/utils/device";
// import { getDeviceToken } from "@/services/notifications.service";
import { registerNotificationToken } from "@/services/notification.service";

const countryCodes = [
  { label: "🇬🇭 +233", value: "+233" },
  { label: "🇺🇸 +1", value: "+1" },
  { label: "🇬🇧 +44", value: "+44" },
  { label: "🇳🇬 +234", value: "+234" },
  { label: "🇿🇦 +27", value: "+27" },
  { label: "🇰🇪 +254", value: "+254" },
];

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState("551448215");
  const [countryCode, setCountryCode] = useState("+233");
  const [password, setPassword] = useState("Sitsofe@123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { refreshTransactions } = useTransactions();
  const { refreshPayments } = usePayments();
  const { setUser } = useUser();

  const handleLogin = async () => {
    if (loading) return;

    const cleanedPhone = phoneNumber.replace(/\s/g, "");

    if (!cleanedPhone) {
      Alert.alert("Validation", "Enter your phone number.");
      return;
    }

    if (cleanedPhone.length !== 9) {
      Alert.alert("Validation", "Enter a valid Ghana phone number.");
      return;
    }

    if (!password.trim()) {
      Alert.alert("Validation", "Enter your password.");
      return;
    }

    try {
      console.log("Before login");

      setLoading(true);

      const fullPhone = `0${cleanedPhone}`;

      console.log("Calling login...");

      const response = await login(fullPhone, password, getDeviceInfo());

      console.log("LOGaIN RESPONSE:", response);

      if (!response.success) {
        Alert.alert("Login Failed", response.message);
        return;
      }

      if (response.data.requires_otp) {
        Alert.alert(
          "OTP Required",
          "Please verify the OTP sent to your phone.",
        );

        router.push({
          pathname: "/otp-verification",
          params: {
            phone: fullPhone,
            purpose: "LOGIN",
          },
        });

        return;
      }

      // const device = await getDeviceToken();

      // if (device) {
      //   try {
      //     await registerNotificationToken({
      //       fcm_token: device.token,
      //       platform: device.platform,
      //     });
      //   } catch (error) {
      //     console.log("Notification registration failed:", error);
      //   }
      // }

      const { full_name, phone, email, ...rest } = response.data.user;

      setUser({
        ...(rest as Partial<User>),
        fullName: full_name,
        phoneNumber: phone,
        email: email ?? "",
        region: "",
        category: "",
        plan: "FREE",
        label: "",
        tin: "",
        taxpayer_category: "",
        active_profile: false,
      });

      console.log("Refreshing authenticated data...");

      await Promise.all([refreshTransactions(), refreshPayments()]);

      console.log("Authenticated data refreshed.");

      console.log("Navigating to dashboard...");
      router.replace("/(tabs)/dashboard");
    } catch (error: any) {
      console.log(error);

      Alert.alert(
        "Login Failed",
        error?.response?.data?.message ?? "Unable to connect to the server.",
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
      <View style={styles.logoCircle}>
        <Text style={styles.logoLetter}>T</Text>
      </View>

      <Text style={styles.title}>Welcome Back</Text>

      <Text style={styles.subtitle}>Log in to your TaxPadi account</Text>

      <Text style={styles.label}>PHONE NUMBER</Text>

      <View style={styles.phoneContainer}>
        <Dropdown
          style={styles.countryDropdown}
          selectedTextStyle={styles.dropdownText}
          data={countryCodes}
          labelField="label"
          valueField="value"
          value={countryCode}
          onChange={(item) => setCountryCode(item.value)}
        />

        <TextInput
          style={styles.phoneInput}
          placeholder="24 123 4567"
          placeholderTextColor="#6B7280"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={(text) => {
            const cleaned = text.replace(/\D/g, "");

            let formatted = cleaned;

            if (cleaned.length > 2) {
              formatted = cleaned.replace(
                /(\d{2})(\d{0,3})(\d{0,4})/,
                (_, p1, p2, p3) => [p1, p2, p3].filter(Boolean).join(" "),
              );
            }

            setPhoneNumber(formatted);
          }}
        />
      </View>

      <Text style={styles.label}>PASSWORD</Text>

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="••••••••"
          placeholderTextColor="#6B7280"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={22}
            color="#6B7280"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => router.push("/forgot-password")}>
        <Text style={styles.link}>Forgot password?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Logging In..." : "Log In"}
        </Text>
      </TouchableOpacity>

      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.orText}>or</Text>
        <View style={styles.divider} />
      </View>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() =>
          router.push({
            pathname: "/otp-verification",
            params: {
              purpose: "LOGIN",
            },
          })
        }
      >
        <Text style={styles.secondaryButtonText}>Continue with OTP</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/register")}>
        <Text style={styles.registerText}>New to TaxPadi? Register</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 16,
    paddingTop: 44,
  },

  logoCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#C44736",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 32,
  },

  logoLetter: {
    color: "#FFFFFF",
    fontSize: 26,
    fontFamily: "Inter_700Bold",
  },

  title: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    marginBottom: 6,
  },

  subtitle: {
    color: "#6B7280",
    marginBottom: 28,
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 18,
    fontFamily: "Inter_400Regular",
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

  link: {
    color: "#C44736",
    textAlign: "right",
    marginTop: 8,
    marginBottom: 24,
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },

  button: {
    backgroundColor: "#C44736",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
  },

  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },

  orText: {
    marginHorizontal: 12,
    color: "#6B7280",
    fontFamily: "Inter_400Regular",
  },

  secondaryButton: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },

  secondaryButtonText: {
    color: "#111827",
    fontFamily: "Inter_500Medium",
  },

  registerText: {
    textAlign: "center",
    marginTop: 24,
    color: "#111827",
    fontFamily: "Inter_400Regular",
  },

  phoneContainer: {
    flexDirection: "row",
    marginBottom: 18,
  },

  countryDropdown: {
    width: 115,
    height: 56,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 10,
    marginRight: 8,
  },

  dropdownText: {
    color: "#111827",
    fontFamily: "Inter_400Regular",
  },

  phoneInput: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 56,
    fontFamily: "Inter_400Regular",

    ...(Platform.OS === "web"
      ? {
          outlineWidth: 0,
        }
      : {}),
  },
});

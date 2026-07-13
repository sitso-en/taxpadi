import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";

import { register } from "@/services/auth.service";

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

export default function RegisterScreen() {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+233");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [region, setRegion] = useState("Greater Accra");
  const [category, setCategory] = useState("Individual");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName.trim()) {
      Alert.alert("Validation", "Enter your full name.");
      return;
    }

    if (!phoneNumber.trim()) {
      Alert.alert("Validation", "Enter your phone number.");
      return;
    }

    const cleanedPhone = phoneNumber.replace(/\s/g, "");

    if (cleanedPhone.replace(/\D/g, "").length !== 9) {
      Alert.alert("Validation", "Enter a valid Ghana phone number.");
      return;
    }

    if (!password.trim()) {
      Alert.alert("Validation", "Enter a password.");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Validation", "Password must be at least 8 characters.");
      return;
    }

    if (loading) return;

    try {
      setLoading(true);

      const fullPhone = `0${cleanedPhone}`;

      const response = await register({
        full_name: fullName,
        phone: fullPhone,
        email: email || undefined,
        password,
        region,
        taxpayer_category: category,
      });

      if (!response.success) {
        Alert.alert("Registration Failed", response.message);
        return;
      }

      router.push("/otp-verification");
    } catch (error: any) {
      Alert.alert(
        "Registration Failed",
        error?.response?.data?.message ??
          "Unable to register."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Create Account</Text>

        <Text style={styles.subtitle}>
          Join thousands of Ghanaians managing their taxes smarter.
        </Text>

        <Text style={styles.label}>FULL NAME</Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. Kofi Mensah"
          placeholderTextColor="#6B7280"
          value={fullName}
          onChangeText={setFullName}
        />

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
                  (_, p1, p2, p3) =>
                    [p1, p2, p3]
                      .filter(Boolean)
                      .join(" ")
                );
              }

              setPhoneNumber(formatted);
            }}
          />
        </View>

        <Text style={styles.label}>EMAIL (OPTIONAL)</Text>

        <TextInput
          style={styles.input}
          placeholder="you@email.com"
          placeholderTextColor="#6B7280"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

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

          <TouchableOpacity
            onPress={() =>
              setShowPassword(!showPassword)
            }
          >
            <Ionicons
              name={
                showPassword
                  ? "eye-off-outline"
                  : "eye-outline"
              }
              size={22}
              color="#6B7280"
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>REGION</Text>

        <Dropdown
          style={styles.dropdown}
          placeholderStyle={
            styles.dropdownPlaceholder
          }
          selectedTextStyle={
            styles.dropdownText
          }
          data={regions}
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder="Select Region"
          value={region}
          onChange={(item) =>
            setRegion(item.value)
          }
        />

        <Text style={styles.label}>
          TAXPAYER CATEGORY
        </Text>

        <View style={styles.categoryContainer}>
          {[
            "Individual",
            "Sole Trader",
            "Small Business",
          ].map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.categoryButton,
                category === item &&
                  styles.selectedCategory,
              ]}
              onPress={() =>
                setCategory(item)
              }
            >
              <Text
                style={[
                  styles.categoryText,
                  category === item &&
                    styles.selectedCategoryText,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            loading && { opacity: 0.7 },
          ]}
          disabled={loading}
          onPress={handleRegister}
        >
          <Text style={styles.buttonText}>
            {loading ? "Creating Account..." : "Create Account"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            router.replace("/login")
          }
        >
          <Text style={styles.loginText}>
            Already have an account? Log In
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 24,
    paddingTop: 60,
  },

  title: {
    fontSize: 32,
    color: "#111827",
    fontFamily: "Inter_700Bold",
    marginBottom: 6,
  },

  subtitle: {
    color: "#6B7280",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginBottom: 24,
  },

  label: {
    fontSize: 11,
    color: "#C44736",
    fontFamily: "Inter_600SemiBold",
    marginBottom: 8,
    marginTop: 8,
  },

  input: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 8,
    fontFamily: "Inter_400Regular",
  },

  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
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

  dropdown: {
    height: 56,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },

  dropdownPlaceholder: {
    color: "#6B7280",
    fontFamily: "Inter_400Regular",
  },

  dropdownText: {
    color: "#111827",
    fontFamily: "Inter_400Regular",
  },

  categoryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
  },

  categoryButton: {
    backgroundColor: "#ECECEC",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 8,
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

  button: {
    backgroundColor: "#C44736",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFFFFF",
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
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 10,
    marginRight: 8,
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
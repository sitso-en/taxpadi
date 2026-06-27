import React, { useState } from "react";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Dropdown } from "react-native-element-dropdown";

import { useUser } from "../context/UserContext";

const countryCodes = [
  { label: "🇬🇭 +233", value: "+233" },
  { label: "🇺🇸 +1", value: "+1" },
  { label: "🇬🇧 +44", value: "+44" },
  { label: "🇳🇬 +234", value: "+234" },
];

const regions = [
  { label: "Ashanti Region", value: "Ashanti Region" },
  { label: "Greater Accra", value: "Greater Accra" },
  { label: "Central Region", value: "Central Region" },
  { label: "Western Region", value: "Western Region" },
  { label: "Eastern Region", value: "Eastern Region" },
  { label: "Volta Region", value: "Volta Region" },
  { label: "Northern Region", value: "Northern Region" },
];

const categories = [
  { label: "Retail", value: "Retail" },
  { label: "Manufacturing", value: "Manufacturing" },
  { label: "Consultancy", value: "Consultancy" },
  { label: "Agriculture", value: "Agriculture" },
  { label: "Technology", value: "Technology" },
  { label: "Services", value: "Services" },
];

export default function AlterProfileScreen() {
  const { user, updateUser } = useUser();

  const [fullName, setFullName] = useState(
    user.fullName
  );

  const [countryCode, setCountryCode] =
    useState("+233");

  const [phoneNumber, setPhoneNumber] =
    useState(user.phoneNumber);

  const [email, setEmail] = useState(
    user.email
  );

  const [region, setRegion] = useState(
    user.region
  );

  const [category, setCategory] =
    useState(user.category);

  const saveProfile = () => {
    if (
      !fullName ||
      !phoneNumber ||
      !email ||
      !region ||
      !category
    ) {
      Alert.alert(
        "Missing Information",
        "Please complete all fields."
      );

      return;
    }

    updateUser({
      fullName,
      phoneNumber:
        countryCode + " " + phoneNumber,
      email,
      region,
      category,
    });

    Alert.alert(
      "Success",
      "Profile updated successfully."
    );

    router.back();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingBottom: 50,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#C44736"
          />
        </TouchableOpacity>

        <Text style={styles.title}>
          Edit Profile
        </Text>
      </View>

      {/* Full Name */}

      <Text style={styles.label}>
        FULL NAME
      </Text>

      <TextInput
        style={styles.input}
        value={fullName}
        onChangeText={setFullName}
        placeholder="Full Name"
      />

      {/* Phone */}

      <Text style={styles.label}>
        PHONE NUMBER
      </Text>

      <View style={styles.phoneContainer}>
        <Dropdown
          style={styles.countryDropdown}
          selectedTextStyle={
            styles.dropdownText
          }
          data={countryCodes}
          labelField="label"
          valueField="value"
          value={countryCode}
          onChange={(item) =>
            setCountryCode(item.value)
          }
        />

      <TextInput
  style={styles.phoneInput}
  placeholder="24 123 4567"
  placeholderTextColor="#9CA3AF"
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

      {/* Email */}

      <Text style={styles.label}>
        EMAIL ADDRESS
      </Text>

      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        placeholder="Email Address"
      />

      {/* Region */}

      <Text style={styles.label}>
        REGION
      </Text>

      <Dropdown
        style={styles.dropdown}
        data={regions}
        labelField="label"
        valueField="value"
        value={region}
        placeholder="Select Region"
        onChange={(item) =>
          setRegion(item.value)
        }
      />

      {/* Category */}

      <Text style={styles.label}>
        BUSINESS CATEGORY
      </Text>

      <Dropdown
        style={styles.dropdown}
        data={categories}
        labelField="label"
        valueField="value"
        value={category}
        placeholder="Select Category"
        onChange={(item) =>
          setCategory(item.value)
        }
      />

      {/* Save */}

      <TouchableOpacity
        style={styles.button}
        onPress={saveProfile}
      >
        <Text style={styles.buttonText}>
          Save Changes
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 20,
    paddingTop: 55,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },

  title: {
    fontSize: 30,
    marginLeft: 12,
    color: "#111827",
    fontFamily: "Inter_700Bold",
  },

  label: {
    color: "#C44736",
    fontSize: 11,
    marginBottom: 8,
    marginTop: 10,
    fontFamily: "Inter_600SemiBold",
  },

  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 18,
    fontFamily: "Inter_400Regular",

    ...(Platform.OS === "web"
      ? { outlineWidth: 0 }
      : {}),
  },

  phoneContainer: {
    flexDirection: "row",
    marginBottom: 18,
  },

  countryDropdown: {
    width: 115,
    height: 56,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 10,
    marginRight: 8,
  },

  dropdownText: {
    color: "#111827",
  },

 phoneInput: {
  flex: 1,
  backgroundColor: "#FFFFFF",
  borderRadius: 12,
  paddingHorizontal: 16,
  minHeight: 56,
  color: "#111827", // user typed text will be dark

  ...(Platform.OS === "web"
    ? { outlineWidth: 0 }
    : {}),
},

  dropdown: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 18,
  },

  button: {
    backgroundColor: "#C44736",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 25,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
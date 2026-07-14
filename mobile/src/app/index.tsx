import { router } from "expo-router";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function WelcomeScreen() {
  
  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoLetter}>T</Text>
        </View>

        <Text style={styles.logoText}>TaxPadi</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.heading}>
          Know your taxes.{"\n"}
          Own your money.
        </Text>

        <Text style={styles.description}>
          TaxPadi makes Ghana tax compliance simple,
          automated, and stress-free.
        </Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttonSection}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push("/register")}
        >
          <Text style={styles.primaryButtonText}>
            Get Started
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.secondaryButtonText}>
            I already have an account
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
  flex: 1,
  backgroundColor: "#FFFFFF",
  paddingHorizontal: 24,
  paddingTop: 20,
},

  logoContainer: {
  alignItems: "center",
  marginTop: 20,
  marginBottom: 60,
},

  logoCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#C44736",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  logoLetter: {
    color: "#FFFFFF",
    fontSize: 28,
    fontFamily: "Inter_700Bold",
  },

  logoText: {
    fontSize: 36,
    color: "#111827",
    fontFamily: "Inter_700Bold",
  },

  content: {
  marginBottom: 80,
},

  heading: {
    fontSize: 36,
    lineHeight: 44,
    color: "#111827",
    fontFamily: "Inter_700Bold",
    marginBottom: 16,
  },

  description: {
    color: "#6B7280",
    fontSize: 16,
    lineHeight: 24,
    fontFamily: "Inter_400Regular",
  },

  buttonSection: {
  width: "100%",
},

  primaryButton: {
    backgroundColor: "#C44736",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 14,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },

  secondaryButton: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },

  secondaryButtonText: {
    color: "#111827",
    fontSize: 16,
    fontFamily: "Inter_500Medium",
  },
});
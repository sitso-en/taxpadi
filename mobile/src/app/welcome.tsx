import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getAccessToken } from "@/utils/storage";

export default function WelcomeScreen() {
  useEffect(() => {
    const checkAuthentication = async () => {
      const token = await getAccessToken();

      if (token) {
        router.replace("/(tabs)/dashboard");
      }
    };

    checkAuthentication();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoLetter}>T</Text>
        </View>

        <Text style={styles.logoText}>TaxPadi</Text>
      </View>

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
    </SafeAreaView>
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
    width: 64,
    height: 64,
    borderRadius: 32,
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
    fontSize: 32,
    color: "#111827",
    fontFamily: "Inter_700Bold",
  },

  content: {
    marginBottom: 80,
  },

  heading: {
    fontSize: 34,
    lineHeight: 42,
    color: "#111827",
    fontFamily: "Inter_700Bold",
    marginBottom: 16,
  },

  description: {
    color: "#6B7280",
    fontSize: 15,
    lineHeight: 23,
    fontFamily: "Inter_400Regular",
  },

  buttonSection: {
    width: "100%",
  },

  primaryButton: {
    backgroundColor: "#C44736",
    borderRadius: 16,
    paddingVertical: 18,
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
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
  },

  secondaryButtonText: {
    color: "#111827",
    fontSize: 16,
    fontFamily: "Inter_500Medium",
  },
});
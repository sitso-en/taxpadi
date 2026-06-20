import { router } from "expo-router";
import { useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function OTPVerificationScreen() {
  const [otp, setOtp] = useState("");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>OTP Verification</Text>

      <Text style={styles.subtitle}>
        Enter the verification code sent to your email
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Enter OTP"
        keyboardType="numeric"
        value={otp}
        onChangeText={setOtp}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace("/dashboard")}
      >
        <Text style={styles.buttonText}>Verify</Text>
      </TouchableOpacity>

      <TouchableOpacity>
        <Text style={styles.resend}>Resend Code</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    padding: 24,
    justifyContent: "center",
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
  },

  subtitle: {
    textAlign: "center",
    color: "#666",
    marginTop: 10,
    marginBottom: 30,
  },

  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
    textAlign: "center",
    fontSize: 18,
  },

  button: {
    backgroundColor: "#C44736",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  resend: {
    textAlign: "center",
    marginTop: 20,
    color: "#C44736",
  },
});

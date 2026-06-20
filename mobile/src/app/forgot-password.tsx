import { router } from "expo-router";
import { useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>

      <Text style={styles.subtitle}>
        Enter your email address to receive a reset code
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email Address"
        value={email}
        onChangeText={setEmail}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/otp-verification")}
      >
        <Text style={styles.buttonText}>Send Reset Code</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace("/login")}>
        <Text style={styles.link}>Back to Login</Text>
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

  link: {
    textAlign: "center",
    marginTop: 20,
    color: "#C44736",
  },
});

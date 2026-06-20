import { router } from "expo-router";
import { useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    router.replace("/dashboard");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>TaxPadi</Text>

      <Text style={styles.title}>Welcome Back</Text>

      <Text style={styles.subtitle}>
        Sign in to continue managing your taxes
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email Address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity onPress={() => router.push("/forgot-password")}>
        <Text style={styles.link}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/register")}>
        <Text style={styles.registerText}>Don't have an account? Register</Text>
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

  logo: {
    fontSize: 38,
    fontWeight: "bold",
    textAlign: "center",
    color: "#C44736",
    marginBottom: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
  },

  subtitle: {
    textAlign: "center",
    color: "#666",
    marginTop: 8,
    marginBottom: 30,
  },

  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
  },

  link: {
    color: "#C44736",
    textAlign: "right",
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
    fontSize: 16,
  },

  registerText: {
    textAlign: "center",
    marginTop: 20,
    color: "#666",
  },
});

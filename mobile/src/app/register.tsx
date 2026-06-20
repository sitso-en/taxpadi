import { router } from "expo-router";
import { useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function RegisterScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = () => {
    router.push("/otp-verification");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>TaxPadi</Text>

      <Text style={styles.title}>Create Account</Text>

      <Text style={styles.subtitle}>
        Join TaxPadi and manage your taxes easily
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={fullName}
        onChangeText={setFullName}
      />

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

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Create Account</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace("/login")}>
        <Text style={styles.loginText}>Already have an account? Sign In</Text>
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

  loginText: {
    textAlign: "center",
    marginTop: 20,
    color: "#666",
  },
});

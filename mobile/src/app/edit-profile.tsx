import { useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function EditProfileScreen() {
  const [fullName, setFullName] = useState("");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{fullName || "Edit Profile"}</Text>

      <Text style={styles.subtitle}>Update your personal information</Text>
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={fullName}
        onChangeText={setFullName}
      />
      <TextInput style={styles.input} placeholder="Email Address" />
      <TextInput style={styles.input} placeholder="Phone Number" />
      <TouchableOpacity
        style={styles.button}
        onPress={() => alert("Profile updated successfully!")}
      >
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#110503",
  },

  subtitle: {
    marginTop: 10,
    fontSize: 16,
    color: "#1F1F1F",
  },
  input: {
    width: "80%",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EBEBEB",
    borderRadius: 10,
    padding: 12,
    marginTop: 20,
  },
  button: {
    width: "80%",
    backgroundColor: "#B83729",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});

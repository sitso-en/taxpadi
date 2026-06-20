import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function LogoutConfirmationScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>
        Are you sure you want to log out of your account?
      </Text>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => router.replace("/login")}
      >
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => {
          console.log("CANCEL PRESSED");
          router.push("/more");
        }}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
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
    padding: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#110503",
    marginBottom: 20,
  },

  message: {
    fontSize: 16,
    textAlign: "center",
    color: "#1F1F1F",
    marginBottom: 30,
  },

  logoutButton: {
    width: "80%",
    backgroundColor: "#C44736",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  logoutButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },

  cancelButton: {
    width: "80%",
    marginTop: 15,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#EBEBEB",
    alignItems: "center",
  },

  cancelButtonText: {
    color: "#110503",
    fontWeight: "600",
  },
  backButton: {
    marginTop: 20,
    marginBottom: 10,
  },

  backText: {
    color: "#C44736",
    fontSize: 24,
    fontWeight: "bold",
  },
});

import { Ionicons } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { clearTokens, getRefreshToken } from "@/utils/storage";
import { clearAllCaches } from "@/utils/cache";
import { logout } from "@/services/auth.service";
import { useUser } from "../context/UserContext";

export default function LogoutConfirmationScreen() {
  const { setUser } = useUser();
  const navigation = useNavigation();

  const resetToLogin = () =>
    (navigation as any).reset({ index: 0, routes: [{ name: "login" }] });

  const handleLogout = async () => {
    try {
      const refreshToken = await getRefreshToken();

      if (refreshToken) {
        try {
          await logout(refreshToken);
        } catch {
        }
      }

      await clearAllCaches();
      await clearTokens();

      setUser({
        fullName: "User",
        phoneNumber: "",
        email: "",
        region: "",
        category: "",
        subscription_tier: "FREE",
        is_active: false,
        is_verified: false,
        label: "",
        tin: "",
        taxpayer_category: "",
        active_profile: false,
      });

      resetToLogin();
    } catch {
      resetToLogin();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name="log-out-outline" size={42} color="#C44736" />
      </View>

      <Text style={styles.title}>Log Out</Text>

      <Text style={styles.message}>
        Are you sure you want to log out of your TaxPadi account?
      </Text>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => router.back()}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2EDE8",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#FCE8E6",
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 34,
    color: "#111827",
    fontFamily: "Inter_700Bold",
    marginTop: 20,
    marginBottom: 10,
  },

  message: {
    fontSize: 15,
    textAlign: "center",
    color: "#6B7280",
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    marginBottom: 34,
  },

  logoutButton: {
    width: "100%",
    backgroundColor: "#C44736",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 5,
  },

  logoutButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },

  cancelButton: {
    width: "100%",
    marginTop: 16,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },

  cancelButtonText: {
    color: "#111827",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
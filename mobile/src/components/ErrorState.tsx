import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  onRetry: () => void;
  message?: string;
};

export default function ErrorState({
  onRetry,
  message = "Check your connection and try again.",
}: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name="cloud-offline-outline" size={52} color="#D1D5DB" />
      <Text style={styles.title}>Couldn't load data</Text>
      <Text style={styles.message}>{message}</Text>
      <TouchableOpacity style={styles.retryBtn} onPress={onRetry} activeOpacity={0.8}>
        <Text style={styles.retryText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#374151",
    marginTop: 16,
    marginBottom: 6,
  },
  message: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 24,
  },
  retryBtn: {
    backgroundColor: "#C44736",
    paddingVertical: 11,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  retryText: {
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
});

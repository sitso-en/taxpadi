import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useNetwork } from "@/context/NetworkContext";

export default function OfflineFormNotice() {
  const { isOnline } = useNetwork();
  if (isOnline) return null;

  return (
    <View style={styles.container}>
      <Ionicons name="cloud-offline-outline" size={15} color="#92400E" />
      <Text style={styles.text}>
        You're offline. Connect to the internet before submitting.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
    gap: 8,
  },
  text: {
    flex: 1,
    color: "#92400E",
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
});

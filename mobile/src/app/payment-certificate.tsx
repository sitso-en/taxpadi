import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { usePayments } from "@/context/PaymentContext";
import { getUserFriendlyError } from "@/utils/error";

export default function PaymentCertificateScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getCertificate } = usePayments();

  const [certificate, setCertificate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // replace with real payment id later
        const paymentId = id || "";

        if (!paymentId) {
          setLoading(false);
          return;
        }

        const response = await getCertificate(paymentId);
        setCertificate(response.data);
      } catch (error) {
        console.log(error);
       Alert.alert(
  "Unable to Load Payment Certificate",
  getUserFriendlyError(error)
);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const downloadCertificate = async () => {
    if (!certificate?.document_ref) {
      Alert.alert("Unavailable", "Certificate PDF is not available yet.");
      return;
    }
    await Linking.openURL(certificate.document_ref);
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#C44736" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.iconCircle}>
        <Ionicons name="shield-checkmark" size={60} color="#FFFFFF" />
      </View>

      <Text style={styles.title}>Payment Certificate</Text>

      <Text style={styles.subtitle}>
        This certifies that your tax payment has been successfully received.
      </Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Certificate No.</Text>
          <Text style={styles.value}>
            {certificate?.certificate_id ?? "-"}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>Status</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {certificate ? "VALID" : "UNAVAILABLE"}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>Issued On</Text>
          <Text style={styles.value}>
            {certificate?.issued_at
              ? new Date(certificate.issued_at).toLocaleDateString()
              : "-"}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>Issued By</Text>
          <Text style={styles.value}>
            {certificate?.taxpayer?.full_name ?? "Ghana Revenue Authority"}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.downloadButton}
        onPress={downloadCertificate}
      >
        <Ionicons name="download-outline" size={20} color="#FFFFFF" />
        <Text style={styles.downloadText}>Download PDF</Text>
      </TouchableOpacity>

     <TouchableOpacity
  style={styles.downloadButton}
  onPress={() => router.push("/receipt")}
>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 16,
    paddingTop: 44,
  },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#34A853",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  title: {
    marginTop: 24,
    fontSize: 30,
    color: "#111827",
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 30,
    textAlign: "center",
    color: "#6B7280",
    fontFamily: "Inter_400Regular",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: "#ECECEC",
    marginBottom: 28,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 16,
  },
  label: {
    color: "#6B7280",
    fontFamily: "Inter_500Medium",
  },
  value: {
    color: "#111827",
    fontFamily: "Inter_600SemiBold",
  },
  badge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: "#15803D",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  downloadButton: {
    backgroundColor: "#C44736",
    borderRadius: 14,
    paddingVertical: 18,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 16,
  },
  downloadText: {
    color: "#FFFFFF",
    marginHorizontal: 8,
    fontFamily: "Inter_600SemiBold",
  },
  backButton: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
  },
  backText: {
    color: "#111827",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
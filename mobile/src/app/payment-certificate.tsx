import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

import { usePayments } from "@/context/PaymentContext";
import { getUserFriendlyError } from "@/utils/error";
import { useToast } from "@/context/ToastContext";

export default function PaymentCertificateScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getCertificate } = usePayments();
  const { showToast } = useToast();

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
        showToast(getUserFriendlyError(error), "error");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const downloadCertificate = async () => {
    const url = certificate?.pdf_url;
    if (!url) {
      showToast("Certificate PDF is not available yet.", "info");
      return;
    }
    try {
      const localUri = `${FileSystem.cacheDirectory}taxpadi_payment_cert_${Date.now()}.pdf`;
      const { uri } = await FileSystem.downloadAsync(url, localUri);
      await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: "Share Certificate" });
    } catch (error) {
      showToast(getUserFriendlyError(error), "error");
    }
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
      contentContainerStyle={{ paddingBottom: 48 }}
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
        <Ionicons name="share-outline" size={20} color="#FFFFFF" />
        <Text style={styles.downloadText}>Share PDF</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2EDE8",
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
    fontSize: 24,
    color: "#111827",
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 20,
    textAlign: "center",
    color: "#6B7280",
    fontFamily: "Inter_400Regular",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ECECEC",
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#EDE8E3",
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
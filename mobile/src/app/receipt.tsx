import React, {
  useMemo,
  useState,
  useEffect,
} from "react";

import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { usePayments } from "@/context/PaymentContext";

export default function ReceiptScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    checkPaymentStatus,
    getCertificate,
  } = usePayments();

  const [payment, setPayment] = useState<any>(null);
  const [certificate, setCertificate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReceipt();
  }, []);

  const loadReceipt = async () => {
    try {
      const paymentResponse = await checkPaymentStatus(id);
      setPayment(paymentResponse.data);

      try {
        const certificateResponse = await getCertificate(id);
        setCertificate(certificateResponse.data);
      } catch {}

    } finally {
      setLoading(false);
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
        <ActivityIndicator
          size="large"
          color="#C44736"
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingBottom: 40,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Success Icon */}
      <View style={styles.successCircle}>
        <Ionicons
          name="checkmark"
          size={60}
          color="#FFFFFF"
        />
      </View>

      <Text style={styles.title}>
        Payment Successful
      </Text>

      <Text style={styles.subtitle}>
        Your payment has been processed successfully.
      </Text>

      {/* Receipt Card */}
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>
            Receipt Number
          </Text>

          <Text style={styles.value}>
            {payment?.payment_reference ??
              certificate?.document_ref ??
              "N/A"}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>
            Amount Paid
          </Text>

          <Text style={styles.amount}>
            GH¢ {Number(
              certificate?.amount_paid ??
              payment?.amount ??
              0
            ).toFixed(2)}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>
            Payment Method
          </Text>

          <Text style={styles.value}>
            {payment?.payment_method ?? "N/A"}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>
            Date
          </Text>

          <Text style={styles.value}>
            {new Date(
              payment?.paid_at ??
              payment?.created_at
            ).toLocaleString()}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>
            Status
          </Text>

          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {payment?.status ?? "PENDING"}
            </Text>
          </View>
        </View>
      </View>

      {/* Certificate */}
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() =>
          router.push({
            pathname: "/payment-certificate",
            params: {
              id,
            },
          })
        }
      >
        <Ionicons
          name="download-outline"
          size={20}
          color="#C44736"
        />

        <Text style={styles.secondaryButtonText}>
          Download Certificate
        </Text>

        <View style={styles.comingSoonBadge}>
          <Text style={styles.comingSoonText}>
            Soon
          </Text>
        </View>
      </TouchableOpacity>

      {/* Buttons */}
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() =>
          router.replace("/(tabs)/payments")
        }
      >
        <Text style={styles.primaryButtonText}>
          Back to Payments
        </Text>
      </TouchableOpacity>

     <TouchableOpacity
  style={styles.secondaryButton}
  onPress={() =>
    router.push("/payment-certificate")
  }
>
        <Text style={styles.outlineButtonText}>
          Return to Dashboard
        </Text>
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
  successCircle: {
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
    textAlign: "center",
    color: "#6B7280",
    fontFamily: "Inter_400Regular",
    marginBottom: 32,
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
  amount: {
    color: "#C44736",
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  statusBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: "#15803D",
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  secondaryButton: {
    backgroundColor: "#FFF5F3",
    borderRadius: 14,
    paddingVertical: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  secondaryButtonText: {
    color: "#C44736",
    fontFamily: "Inter_600SemiBold",
    marginHorizontal: 8,
  },
  comingSoonBadge: {
    backgroundColor: "#FFF8E7",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  comingSoonText: {
    color: "#A16207",
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },
  primaryButton: {
    backgroundColor: "#C44736",
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 14,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
  },
  outlineButtonText: {
    color: "#111827",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
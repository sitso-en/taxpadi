import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { getUserFriendlyError } from "@/utils/error";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTaxReturns } from "../context/TaxReturnsContext";
import {
  getTaxReturns,
  previewTaxReturn,
  submitTaxReturn,
} from "@/services/taxReturns.service";

export default function TaxReturnReviewScreen() {
  const { returnId } = useLocalSearchParams<{
    returnId: string;
  }>();

  const { fileCurrentReturn } = useTaxReturns();

  const [loading, setLoading] = useState(false);
  const [taxReturn, setTaxReturn] = useState<any>(null);
  const [loadingReturn, setLoadingReturn] = useState(true);

  useEffect(() => {
    const loadReturn = async () => {
      if (!returnId) return;

      try {
        const response = await previewTaxReturn(returnId as string);
        setTaxReturn(response.data ?? response);
      } catch (error: any) {
       Alert.alert(
  "Unable to Load Tax Return",
  getUserFriendlyError(error)
);
      } finally {
        setLoadingReturn(false);
      }
    };

    loadReturn();
  }, [returnId]);

  const handleSubmit = async () => {
    if (loading) return;

    setLoading(true);

    try {
      await submitTaxReturn(returnId as string, "");
      await fileCurrentReturn();

      router.replace("/tax-return-confirmation" as never);
    } catch (error: any) {
      Alert.alert(
  "Tax Return Submission Unsuccessful",
  getUserFriendlyError(error)
);
    } finally {
      setLoading(false);
    }
  };

  if (loadingReturn) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name="chevron-back"
            size={26}
            color="#111827"
          />
        </TouchableOpacity>

        <Text style={styles.title}>
          Review Return
        </Text>
      </View>

      <Text style={styles.subtitle}>
        Review your tax return before submission.
      </Text>

      <View style={styles.card}>
        <Row
          label="Tax Type"
          value={taxReturn?.tax_type ?? "Income Tax"}
        />

        <Divider />

        <Row
          label="Tax Year"
          value={String(taxReturn?.tax_year ?? "")}
        />

        <Divider />

        <Row
          label="Estimated Liability"
          value={`GH¢ ${Number(taxReturn?.tax_liability ?? 0).toFixed(2)}`}
        />

        <Divider />

        <Row
          label="Status"
          value={taxReturn?.status ?? "Draft"}
        />
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Submitting..." : "Submit Tax Return"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 16,
    paddingTop: 44,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },

  title: {
    marginLeft: 10,
    fontSize: 34,
    color: "#111827",
    fontFamily: "Inter_700Bold",
  },

  subtitle: {
    color: "#6B7280",
    fontFamily: "Inter_400Regular",
    marginTop: 2,
    marginBottom: 18,
    fontSize: 13,
    lineHeight: 18,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#ECECEC",
    marginBottom: 30,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 2,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  label: {
    color: "#6B7280",
    fontFamily: "Inter_500Medium",
  },

  value: {
    color: "#111827",
    fontFamily: "Inter_600SemiBold",
  },

  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 16,
  },

  button: {
    backgroundColor: "#C44736",
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
});
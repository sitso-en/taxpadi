import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function TaxpayerProfileScreen() {
  const profile = {
    tin: "P0001234567",
    fullName: "Kwame Mensah",
    taxpayerType: "Individual",
    registrationDate: "12 Jan 2025",
    businessCategory: "Information Technology",
    taxOffice: "Accra Central Tax Office",
    filingStatus: "Compliant",
  };

  const Row = ({
    label,
    value,
  }: {
    label: string;
    value: string;
  }) => (
    <>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>

      <View style={styles.divider} />
    </>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name="arrow-back"
            size={24}
            color="#111827"
          />
        </TouchableOpacity>

        <Text style={styles.title}>
          Taxpayer Profile
        </Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Ionicons
            name="person"
            size={42}
            color="#FFFFFF"
          />
        </View>

        <Text style={styles.name}>
          {profile.fullName}
        </Text>

        <Text style={styles.tin}>
          TIN: {profile.tin}
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Row
          label="Taxpayer Type"
          value={profile.taxpayerType}
        />

        <Row
          label="Registration Date"
          value={profile.registrationDate}
        />

        <Row
          label="Business Category"
          value={profile.businessCategory}
        />

        <Row
          label="Tax Office"
          value={profile.taxOffice}
        />

        <View style={styles.row}>
          <Text style={styles.label}>
            Filing Status
          </Text>

          <View style={styles.status}>
            <Text style={styles.statusText}>
              {profile.filingStatus}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 20,
    paddingTop: 55,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },

  title: {
    fontSize: 30,
    color: "#111827",
    fontFamily: "Inter_700Bold",
    marginLeft: 12,
  },

  profileCard: {
    backgroundColor: "#C44736",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  name: {
    color: "#FFFFFF",
    fontSize: 24,
    fontFamily: "Inter_700Bold",
  },

  tin: {
    color: "#FDECEC",
    marginTop: 6,
    fontFamily: "Inter_500Medium",
  },

  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },

  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
  },

  label: {
    color: "#6B7280",
    fontFamily: "Inter_500Medium",
  },

  value: {
    color: "#111827",
    fontFamily: "Inter_600SemiBold",
    flex: 1,
    textAlign: "right",
    marginLeft: 16,
  },

  status: {
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
});
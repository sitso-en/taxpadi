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

import { useUser } from "../context/UserContext";

export default function CurrentPlanScreen() {
  const { user } = useUser();

  const isPro = user?.active_profile ?? false;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons
          name="arrow-back"
          size={24}
          color="#C44736"
        />
      </TouchableOpacity>

      <Text style={styles.title}>
        Current Plan
      </Text>

      <Text style={styles.subtitle}>
        Your active TaxPadi subscription.
      </Text>

      <View style={styles.card}>
        <View style={styles.icon}>
          <Ionicons
            name="diamond-outline"
            size={42}
            color="#FFFFFF"
          />
        </View>

        <Text style={styles.plan}>
          {isPro ? "ACTIVE" : "INACTIVE"}
        </Text>

        <Text style={styles.status}>
          Active Subscription
        </Text>
      </View>

      <Text style={styles.section}>
        INCLUDED FEATURES
      </Text>

      {[
        "Unlimited Transactions",
        "Invoice Management",
        "Reports & Export",
        "Tax Return Filing",
        "Compliance Certificate",
        "Priority Support",
      ].map((item) => (
        <View key={item} style={styles.feature}>
          <Ionicons
            name="checkmark-circle"
            size={22}
            color="#34A853"
          />

          <Text style={styles.featureText}>
            {item}
          </Text>
        </View>
      ))}

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>
          Billing Status
        </Text>

        <Text style={styles.infoValue}>
          {isPro ? "Active" : "Free Plan"}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          router.push("/manage-plan")
        }
      >
        <Text style={styles.buttonText}>
          Manage Subscription
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:"#FAFAFA",
    padding:20,
    paddingTop:55,
  },

  title:{
    fontSize:30,
    fontFamily:"Inter_700Bold",
    color:"#111827",
    marginTop:20,
  },

  subtitle:{
    color:"#6B7280",
    marginTop:6,
    marginBottom:30,
    fontFamily:"Inter_400Regular",
  },

  card:{
    backgroundColor:"#C44736",
    borderRadius:20,
    alignItems:"center",
    padding:28,
    marginBottom:30,
  },

  icon:{
    width:70,
    height:70,
    borderRadius:35,
    backgroundColor:"rgba(255,255,255,0.2)",
    justifyContent:"center",
    alignItems:"center",
  },

  plan:{
    color:"#FFF",
    fontSize:28,
    fontFamily:"Inter_700Bold",
    marginTop:18,
  },

  status:{
    color:"#FDECEC",
    marginTop:6,
  },

  section:{
    color:"#C44736",
    fontFamily:"Inter_600SemiBold",
    marginBottom:14,
  },

  feature:{
    flexDirection:"row",
    alignItems:"center",
    marginBottom:16,
  },

  featureText:{
    marginLeft:10,
    fontSize:15,
    color:"#111827",
  },

  infoCard:{
    backgroundColor:"#FFF",
    borderRadius:18,
    padding:20,
    marginTop:20,
    marginBottom:30,
  },

  infoTitle:{
    color:"#6B7280",
  },

  infoValue:{
    marginTop:8,
    fontSize:20,
    fontFamily:"Inter_700Bold",
    color:"#34A853",
  },

  button:{
    backgroundColor:"#C44736",
    borderRadius:14,
    padding:18,
    alignItems:"center",
  },

  buttonText:{
    color:"#FFF",
    fontFamily:"Inter_600SemiBold",
    fontSize:16,
  },
});
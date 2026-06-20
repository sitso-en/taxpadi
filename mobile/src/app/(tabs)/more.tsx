import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function MoreScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 30 }}
    >
      <Text style={styles.title}>More</Text>

      <TouchableOpacity
        style={styles.item}
        onPress={() => router.push("/settings")}
      >
        <View style={styles.row}>
          <Ionicons name="settings-outline" size={24} color="#222" />
          <Text style={styles.itemText}>Settings</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        onPress={() => router.push("/subscription")}
      >
        <View style={styles.row}>
          <Ionicons name="card-outline" size={24} color="#222" />
          <Text style={styles.itemText}>Subscription</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        onPress={() => router.push("/tax-profile")}
      >
        <View style={styles.row}>
          <Ionicons name="document-text-outline" size={24} color="#222" />
          <Text style={styles.itemText}>Tax Profile</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.item}
        onPress={() => router.push("/reports")}
      >
        <View style={styles.row}>
          <Ionicons name="bar-chart-outline" size={24} color="#222" />
          <Text style={styles.itemText}>Reports</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        onPress={() => router.push("/invoices")}
      >
        <View style={styles.row}>
          <Ionicons name="receipt-outline" size={24} color="#222" />
          <Text style={styles.itemText}>Invoices</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        onPress={() => router.push("/taxbot")}
      >
        <View style={styles.row}>
          <Ionicons name="chatbubble-ellipses-outline" size={24} color="#222" />
          <Text style={styles.itemText}>TaxBot</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        onPress={() => router.push("/savings-vault")}
      >
        <View style={styles.row}>
          <Ionicons name="wallet-outline" size={24} color="#222" />
          <Text style={styles.itemText}>Savings Vault</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        onPress={() => router.push("/compliance-certificate")}
      >
        <View style={styles.row}>
          <Ionicons name="shield-checkmark-outline" size={24} color="#222" />
          <Text style={styles.itemText}>Compliance Certificate</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        onPress={() => router.push("/referral-offers")}
      >
        <View style={styles.row}>
          <Ionicons name="gift-outline" size={24} color="#222" />
          <Text style={styles.itemText}>Referral Offers</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        onPress={() => router.push("/logout-confirmation")}
      >
        <View style={styles.row}>
          <Ionicons name="log-out-outline" size={24} color="#C44736" />
          <Text style={[styles.itemText, { color: "#C44736" }]}>Logout</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    padding: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 50,
    marginBottom: 20,
    color: "#111",
  },

  item: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 6,

    elevation: 2,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  itemText: {
    marginLeft: 14,
    fontSize: 16,
    color: "#222",
    fontWeight: "500",
  },
});

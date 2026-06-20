import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function ReferralOffersScreen() {
  const referralCode = "TAXPADI2026";

  const handleShare = () => {
    Alert.alert("Referral Shared", `Your referral code is ${referralCode}`);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#C44736" />
      </TouchableOpacity>

      <Text style={styles.title}>Referral Offers</Text>

      <View style={styles.heroCard}>
        <Ionicons name="gift-outline" size={60} color="#FFFFFF" />

        <Text style={styles.heroTitle}>Earn Rewards</Text>

        <Text style={styles.heroText}>
          Invite friends and earn discounts on future subscriptions.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Your Referral Code</Text>

        <Text style={styles.code}>{referralCode}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Rewards</Text>

        <Text>• Refer 1 friend → 5% discount</Text>
        <Text>• Refer 5 friends → 20% discount</Text>
        <Text>• Refer 10 friends → Premium badge</Text>
      </View>

      <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
        <Ionicons name="share-social-outline" size={20} color="#FFFFFF" />

        <Text style={styles.shareText}>Share Referral Code</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    padding: 20,
    paddingTop: 50,
  },

  backButton: {
    marginBottom: 15,
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
  },

  heroCard: {
    backgroundColor: "#C44736",
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
  },

  heroText: {
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: 8,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },

  code: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#C44736",
  },

  shareButton: {
    backgroundColor: "#C44736",
    padding: 15,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  shareText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    marginLeft: 8,
  },
});

import { router } from "expo-router";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function TaxReturnsScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 30 }}
    >
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>⬅️ Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Tax Returns</Text>
      <View style={styles.card}>
        <Text style={styles.returnTitle}>Returns Summary</Text>
        <Text>Filed: 0</Text>
        <Text>Pending: 3</Text>
        <Text>Compliance Status: Good Standing</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.returnTitle}>VAT Return</Text>
        <Text>Status: Not Filed</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.returnTitle}>PAYE Return</Text>
        <Text>Status: Not Filed</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.returnTitle}>Annual Return</Text>
        <Text>Status: Not Filed</Text>
      </View>
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
  },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },

  returnTitle: {
    fontWeight: "bold",
    marginBottom: 4,
  },

  backButton: {
    marginTop: 20,
    marginBottom: 10,
  },

  backText: {
    color: "#B83729",
    fontSize: 24,
    fontWeight: "bold",
  },
});

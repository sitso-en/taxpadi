import { router } from "expo-router";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function DeadlinesScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 30 }}
    >
      

      <Text style={styles.title}>Upcoming Deadlines</Text>
      <View style={styles.card}>
        <Text style={styles.deadlineTitle}>Deadline Summary</Text>
        <Text>Upcoming Deadlines: 3</Text>
        <Text>Overdue Deadlines: 0</Text>
        <Text>Next Due: VAT Filing (15 June 2026)</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.deadlineTitle}>VAT Filing</Text>
        <Text>15 June 2026</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.deadlineTitle}>PAYE Filing</Text>
        <Text>30 June 2026</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.deadlineTitle}>Annual Return</Text>
        <Text>31 December 2026</Text>
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

  deadlineTitle: {
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

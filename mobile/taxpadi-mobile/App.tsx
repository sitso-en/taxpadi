import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>TaxPadi</Text>

      <Text style={styles.subtitle}>Because GRA doesn't forget.</Text>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    color: "white",
    fontSize: 36,
    fontWeight: "bold",
  },

  subtitle: {
    color: "#94A3B8",
    fontSize: 16,
    marginTop: 10,
  },
});

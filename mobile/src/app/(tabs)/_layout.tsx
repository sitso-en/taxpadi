import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FloatingTaxBot from "../../components/FloatingTaxBot";

const TAB_ITEMS = [
  { name: "dashboard",    label: "Home",         icon: "home-outline" },
  { name: "transactions", label: "Transactions", icon: "swap-horizontal-outline" },
  { name: "tax",          label: "Tax",          icon: "document-text-outline" },
  { name: "payments",     label: "Payments",     icon: "card-outline" },
  { name: "more",         label: "More",         icon: "ellipsis-horizontal-circle-outline" },
] as const;

function TabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {TAB_ITEMS.map((tab, index) => {
        const isFocused = state.index === index;
        const route = state.routes[index];

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route?.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(tab.name as never);
          }
        };

        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tabItem}
            onPress={onPress}
            activeOpacity={0.7}
          >
            <Ionicons
              name={tab.icon as any}
              size={24}
              color={isFocused ? "#C44736" : "#8E8E93"}
            />
            <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function Layout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) return null;

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        tabBar={(props) => <TabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="dashboard" />
        <Tabs.Screen name="transactions" />
        <Tabs.Screen name="tax" />
        <Tabs.Screen name="payments" />
        <Tabs.Screen name="more" />
      </Tabs>
      <FloatingTaxBot />
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#F2EDE8",
    borderTopWidth: 1,
    borderTopColor: "#E3D9D0",
    paddingTop: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  tabLabel: {
    fontSize: 10,
    color: "#8E8E93",
    fontFamily: "Inter_400Regular",
  },
  tabLabelActive: {
    color: "#C44736",
    fontFamily: "Inter_600SemiBold",
  },
});

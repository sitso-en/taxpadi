
import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import FloatingTaxBot from "../../components/FloatingTaxBot";





export default function Layout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    
            <>
              <Tabs
                screenOptions={{
                  headerShown: false,
                  tabBarActiveTintColor: "#C44736",
                  tabBarInactiveTintColor: "#8E8E93",
                  tabBarStyle: {
                    height: 70,
                    paddingBottom: 10,
                    paddingTop: 10,
                  },
                }}
              >
                {/* Main Tabs */}

                <Tabs.Screen
                  name="dashboard"
                  options={{
                    title: "Home",
                    tabBarIcon: ({ color, size }) => (
                      <Ionicons name="home-outline" size={size} color={color} />
                    ),
                  }}
                />

                <Tabs.Screen
                  name="transactions"
                  options={{
                    title: "Transactions",
                    tabBarIcon: ({ color, size }) => (
                      <Ionicons
                        name="swap-horizontal-outline"
                        size={size}
                        color={color}
                      />
                    ),
                  }}
                />

                <Tabs.Screen
  name="tax"
  options={{
    title: "Tax",
    tabBarIcon: ({ color, size }) => (
      <Ionicons
        name="document-text-outline"
        size={size}
        color={color}
      />
    ),
  }}
/>

                <Tabs.Screen
                  name="payments"
                  options={{
                    title: "Payments",
                    tabBarIcon: ({ color, size }) => (
                      <Ionicons name="card-outline" size={size} color={color} />
                    ),
                  }}
                />

                <Tabs.Screen
                  name="more"
                  options={{
                    title: "More",
                    tabBarIcon: ({ color, size }) => (
                      <Ionicons
                        name="ellipsis-horizontal-circle-outline"
                        size={size}
                        color={color}
                      />
                    ),
                  }}
                />

                {/* Hidden Screens */}

                <Tabs.Screen
                  name="index"
                  options={{
                    href: null,
                  }}
                />

                <Tabs.Screen
                  name="login"
                  options={{
                    href: null,
                  }}
                />

                <Tabs.Screen
                  name="register"
                  options={{
                    href: null,
                  }}
                />

                <Tabs.Screen
                  name="forgot-password"
                  options={{
                    href: null,
                  }}
                />

                <Tabs.Screen
                  name="otp-verification"
                  options={{
                    href: null,
                  }}
                />

                <Tabs.Screen
                  name="deadlines"
                  options={{
                    href: null,
                  }}
                />

                <Tabs.Screen
                  name="explore"
                  options={{
                    href: null,
                  }}
                />

                <Tabs.Screen
                  name="settings"
                  options={{
                    href: null,
                  }}
                />

                <Tabs.Screen
                  name="tax-profile"
                  options={{
                    href: null,
                  }}
                />

                <Tabs.Screen
                  name="edit-profile"
                  options={{
                    href: null,
                  }}
                />

                <Tabs.Screen
                  name="subscription"
                  options={{
                    href: null,
                  }}
                />

                <Tabs.Screen
                  name="active-sessions"
                  options={{
                    href: null,
                  }}
                />

                <Tabs.Screen
                  name="logout-confirmation"
                  options={{
                    href: null,
                  }}
                />

                <Tabs.Screen
                  name="notification-preferences"
                  options={{
                    href: null,
                  }}
                />
                <Tabs.Screen
                  name="invoices"
                  options={{
                    href: null,
                  }}
                />
                <Tabs.Screen
                  name="create-invoice"
                  options={{
                    href: null,
                  }}
                />
                <Tabs.Screen
                  name="add-transaction"
                  options={{
                    href: null,
                  }}
                />

                <Tabs.Screen
                  name="edit-transaction"
                  options={{
                    href: null,
                  }}
                />
                <Tabs.Screen
                  name="reports"
                  options={{
                    href: null,
                  }}
                />
                

              </Tabs>

              <FloatingTaxBot />
            </>
          
  );
}

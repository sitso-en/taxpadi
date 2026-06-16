import { Drawer } from "expo-router/drawer";
import { PaymentProvider } from "../context/PaymentContext";
import { ReturnProvider } from "../context/ReturnContext";
import { TransactionProvider } from "../context/TransactionContext";

export default function Layout() {
  return (
    <TransactionProvider>
      <PaymentProvider>
        <ReturnProvider>
          <Drawer
            screenOptions={{
              headerStyle: {
                backgroundColor: "#B83729",
              },
              headerTintColor: "#FFFFFF",
              headerTitleStyle: {
                fontWeight: "bold",
              },
              drawerActiveTintColor: "#B83729",
              drawerLabelStyle: {
                fontSize: 16,
              },
            }}
          >
            <Drawer.Screen
              name="index"
              options={{
                drawerLabel: "Dashboard",
                title: "TaxPadi",
              }}
            />

            <Drawer.Screen
              name="deadlines"
              options={{
                drawerLabel: "Deadlines",
                title: "Deadlines",
              }}
            />

            <Drawer.Screen
              name="transactions"
              options={{
                drawerLabel: "Transactions",
                title: "Transactions",
              }}
            />

            <Drawer.Screen
              name="returns"
              options={{
                drawerLabel: "Tax Returns",
                title: "Tax Returns",
              }}
            />

            <Drawer.Screen
              name="payments"
              options={{
                drawerLabel: "Payments",
                title: "Payments",
              }}
            />

            <Drawer.Screen
              name="reports"
              options={{
                drawerLabel: "Reports & Export",
                title: "Reports",
              }}
            />

            <Drawer.Screen
              name="more"
              options={{
                drawerLabel: "More",
                title: "More",
              }}
            />
          </Drawer>
        </ReturnProvider>
      </PaymentProvider>
    </TransactionProvider>
  );
}

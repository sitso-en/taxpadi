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

            <Drawer.Screen
              name="explore"
              options={{
                drawerItemStyle: { display: "none" },
              }}
            />

            <Drawer.Screen
              name="settings"
              options={{
                drawerItemStyle: { display: "none" },
              }}
            />

            <Drawer.Screen
              name="tax-profile"
              options={{
                drawerItemStyle: { display: "none" },
              }}
            />

            <Drawer.Screen
              name="edit-profile"
              options={{
                drawerItemStyle: { display: "none" },
              }}
            />

            <Drawer.Screen
              name="subscription"
              options={{
                drawerItemStyle: { display: "none" },
              }}
            />

            <Drawer.Screen
              name="active-sessions"
              options={{
                drawerItemStyle: { display: "none" },
              }}
            />

            <Drawer.Screen
              name="add-transaction"
              options={{
                drawerItemStyle: { display: "none" },
              }}
            />

            <Drawer.Screen
              name="edit-transaction"
              options={{
                drawerItemStyle: { display: "none" },
              }}
            />

            <Drawer.Screen
              name="logout-confirmation"
              options={{
                drawerItemStyle: { display: "none" },
              }}
            />

            <Drawer.Screen
              name="notification-preferences"
              options={{
                drawerItemStyle: { display: "none" },
              }}
            />
          </Drawer>
        </ReturnProvider>
      </PaymentProvider>
    </TransactionProvider>
  );
}

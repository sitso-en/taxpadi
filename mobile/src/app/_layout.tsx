import { Stack } from "expo-router";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

import { UserProvider } from "../context/UserContext";
import { InvoiceProvider } from "../context/InvoiceContext";
import { PaymentProvider } from "../context/PaymentContext";
import { ReturnProvider } from "../context/ReturnContext";
import { TransactionProvider } from "../context/TransactionContext";
import { NotificationProvider } from "../context/NotificationContext";
import { DeadlineProvider } from "../context/DeadlineContext";
import { SavingsProvider } from "../context/SavingsContext";
import { ReferralProvider } from "../context/ReferralContext";
import { CertificateProvider } from "../context/CertificateContext";
import { TaxReturnsProvider } from "../context/TaxReturnsContext";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <UserProvider>
      <TransactionProvider>
        <PaymentProvider>
          <ReturnProvider>
            <InvoiceProvider>
              <DeadlineProvider>
                <NotificationProvider>
                  <ReferralProvider>
                    <SavingsProvider>
                      <CertificateProvider>
                        <TaxReturnsProvider>
                          <Stack
                            screenOptions={{
                              headerShown: false,
                            }}
                          >
                            <Stack.Screen name="index" />
                            <Stack.Screen name="login" />
                            <Stack.Screen name="register" />
                            <Stack.Screen name="forgot-password" />
                            <Stack.Screen name="otp-verification" />
                            <Stack.Screen name="tax-returns" />
                            <Stack.Screen name="receipt" />
                            <Stack.Screen name="payment-certificate" />
                            <Stack.Screen name="current-plan" />
                            <Stack.Screen name="manage-plan" />
                            <Stack.Screen name="(tabs)" />
                          </Stack>
                        </TaxReturnsProvider>
                      </CertificateProvider>
                    </SavingsProvider>
                  </ReferralProvider>
                </NotificationProvider>
              </DeadlineProvider>
            </InvoiceProvider>
          </ReturnProvider>
        </PaymentProvider>
      </TransactionProvider>
    </UserProvider>
  );
}
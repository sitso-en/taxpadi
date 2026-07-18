import { Stack } from "expo-router";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { StatusBar } from "expo-status-bar";

import { ToastProvider } from "../context/ToastContext";
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
import { TaxLiabilityProvider } from "../context/TaxLiabilityContext";
import { NetworkProvider } from "../context/NetworkContext";
import { PrivacyProvider } from "../context/PrivacyContext";
import { SubscriptionProvider } from "../context/SubscriptionContext";
import OfflineBanner from "../components/OfflineBanner";

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
    <>
      <StatusBar style="dark" />
      <NetworkProvider>
      <PrivacyProvider>
      <ToastProvider>
      <UserProvider>
        <TransactionProvider>
          <TaxLiabilityProvider>
          <PaymentProvider>
            <ReturnProvider>
              <InvoiceProvider>
                <DeadlineProvider>
                  <NotificationProvider>
                    <ReferralProvider>
                      <SavingsProvider>
                        <CertificateProvider>
                          <TaxReturnsProvider>
                          <SubscriptionProvider>
                            <OfflineBanner />
                            <Stack
                              screenOptions={{
                                headerShown: false,
                              }}
                            >
                              <Stack.Screen name="index" />
                              <Stack.Screen name="welcome" />
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
                          </SubscriptionProvider>
                          </TaxReturnsProvider>
                        </CertificateProvider>
                      </SavingsProvider>
                    </ReferralProvider>
                  </NotificationProvider>
                </DeadlineProvider>
              </InvoiceProvider>
            </ReturnProvider>
          </PaymentProvider>
          </TaxLiabilityProvider>
        </TransactionProvider>
      </UserProvider>
      </ToastProvider>
      </PrivacyProvider>
      </NetworkProvider>
    </>
  );
}

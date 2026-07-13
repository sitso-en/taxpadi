import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getPayments,
  initiatePayment,
  getPaymentStatus,
  getPaymentCertificate,
} from "@/services/payment.service";

type PaymentContextType = {
  payments: any[];
  loading: boolean;
  refreshPayments: () => Promise<void>;
  createPayment: (data: any) => Promise<any>;
  checkPaymentStatus: (id: string) => Promise<any>;
  getCertificate: (id: string) => Promise<any>;
};

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export function PaymentProvider({ children }: { children: React.ReactNode }) {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshPayments = async () => {
    setLoading(true);

    try {
      const response = await getPayments();

      setPayments(
        response.data?.payments ?? response.payments ?? []
      );
    } catch (error) {
      console.error("Failed to load payments", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshPayments();
  }, []);

  const createPayment = async (data: any) => {
    const response = await initiatePayment(data);
    await refreshPayments();
    return response;
  };

  const checkPaymentStatus = async (id: string) => {
    return await getPaymentStatus(id);
  };

  const getCertificate = async (id: string) => {
    return await getPaymentCertificate(id);
  };

  return (
    <PaymentContext.Provider
      value={{
        payments,
        loading,
        refreshPayments,
        createPayment,
        checkPaymentStatus,
        getCertificate,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
}

export function usePayments() {
  const context = useContext(PaymentContext);

  if (!context) {
    throw new Error("usePayments must be used inside PaymentProvider");
  }

  return context;
}
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";

import React, { createContext, useContext, useState } from "react";
import { Payment } from "../data/payments";

type PaymentContextType = {
  payments: Payment[];
  addPayment: (payment: Payment) => void;
  deletePayment: (id: number) => void;
  editPayment: (payment: Payment) => void;
};

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export function PaymentProvider({ children }: { children: React.ReactNode }) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadPayments = async () => {
      try {
        const stored = await AsyncStorage.getItem("payments");

        if (stored) {
          setPayments(JSON.parse(stored));
        }

        setLoaded(true);
      } catch (error) {
        console.error("Failed to load payments", error);
        setLoaded(true);
      }
    };

    loadPayments();
  }, []);

  useEffect(() => {
    if (!loaded) return;

    AsyncStorage.setItem("payments", JSON.stringify(payments));
  }, [payments, loaded]);

  const addPayment = (payment: Payment) => {
    setPayments((prev) => [...prev, payment]);
  };
  const deletePayment = (id: number) => {
    setPayments((prev) => prev.filter((payment) => payment.id !== id));
  };

  const editPayment = (updatedPayment: Payment) => {
    setPayments((prev) =>
      prev.map((payment) =>
        payment.id === updatedPayment.id ? updatedPayment : payment,
      ),
    );
  };

  return (
    <PaymentContext.Provider
      value={{
        payments,
        addPayment,
        deletePayment,
        editPayment,
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

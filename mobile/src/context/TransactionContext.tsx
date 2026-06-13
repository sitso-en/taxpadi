import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Transaction } from "../data/transactions";

type TransactionContextType = {
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;
};

const TransactionContext = createContext<TransactionContextType | undefined>(
  undefined,
);

export function TransactionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 1,
      title: "Sales Revenue",
      amount: 2500,
      type: "income",
    },
    {
      id: 2,
      title: "Office Supplies",
      amount: 400,
      type: "expense",
    },
    {
      id: 3,
      title: "Internet Bill",
      amount: 120,
      type: "expense",
    },
    {
      id: 4,
      title: "Consulting Revenue",
      amount: 1000,
      type: "income",
    },
  ]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const stored = await AsyncStorage.getItem("transactions");

        if (stored) {
          setTransactions(JSON.parse(stored));
        }

        setLoaded(true);
      } catch (error) {
        console.error("Failed to load transactions", error);
        setLoaded(true);
      }
    };

    loadTransactions();
  }, []);

  useEffect(() => {
    if (!loaded) return;

    AsyncStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions, loaded]);

  const addTransaction = (transaction: Transaction) => {
    setTransactions((prev) => [...prev, transaction]);
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        addTransaction,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);

  if (!context) {
    throw new Error("useTransactions must be used inside TransactionProvider");
  }

  return context;
}

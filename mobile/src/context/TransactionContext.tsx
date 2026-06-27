import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Transaction } from "../data/transactions";

type TransactionContextType = {
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: number) => void;
  editTransaction: (transaction: Transaction) => void;
};

const TransactionContext = createContext<
  TransactionContextType | undefined
>(undefined);

export function TransactionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [transactions, setTransactions] =
    useState<Transaction[]>([
      {
        id: 1,
        title: "Sales Revenue",
        amount: 2500,
        type: "income",
        category: "Sales",
        isDeductible: false,
        date: new Date().toISOString(),
      },

      {
        id: 2,
        title: "Office Supplies",
        amount: 400,
        type: "expense",
        category: "Office Supplies",
        isDeductible: true,
        date: new Date().toISOString(),
      },

      {
        id: 3,
        title: "Internet Bill",
        amount: 120,
        type: "expense",
        category: "Utilities",
        isDeductible: true,
        date: new Date().toISOString(),
      },

      {
        id: 4,
        title: "Consulting Revenue",
        amount: 1000,
        type: "income",
        category: "Consulting",
        isDeductible: false,
        date: new Date().toISOString(),
      },
    ]);

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const stored =
          await AsyncStorage.getItem(
            "transactions"
          );

        if (stored) {
          setTransactions(JSON.parse(stored));
        }

        setLoaded(true);
      } catch (error) {
        console.error(
          "Failed to load transactions",
          error
        );

        setLoaded(true);
      }
    };

    loadTransactions();
  }, []);

  useEffect(() => {
    if (!loaded) return;

    AsyncStorage.setItem(
      "transactions",
      JSON.stringify(transactions)
    );
  }, [transactions, loaded]);

  const addTransaction = (
    transaction: Transaction
  ) => {
    setTransactions((prev) => [
      ...prev,
      transaction,
    ]);
  };

  const deleteTransaction = (id: number) => {
    setTransactions((prev) =>
      prev.filter(
        (transaction) =>
          transaction.id !== id
      )
    );
  };

  const editTransaction = (
    updatedTransaction: Transaction
  ) => {
    setTransactions((prev) =>
      prev.map((transaction) =>
        transaction.id ===
        updatedTransaction.id
          ? updatedTransaction
          : transaction
      )
    );
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        addTransaction,
        deleteTransaction,
        editTransaction,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(
    TransactionContext
  );

  if (!context) {
    throw new Error(
      "useTransactions must be used inside TransactionProvider"
    );
  }

  return context;
}
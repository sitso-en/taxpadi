import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction as deleteTransactionApi,
} from "@/services/transaction.service";

type TransactionContextType = {
  transactions: any[];
  loading: boolean;
  refreshTransactions: () => Promise<void>;
  addTransaction: (data: any) => Promise<void>;
  editTransaction: (id: string, data: any) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
};

const TransactionContext = createContext<TransactionContextType | undefined>(
  undefined,
);
export function TransactionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshTransactions = async () => {
    setLoading(true);

    try {
      const response = await getTransactions({
        page: 1,
        limit: 20,
      });

      setTransactions(
        response.data?.transactions ?? response.transactions ?? [],
      );
    } catch (error: any) {
      console.log(error);

      console.log(error.response?.status);

      console.log(error.response?.data);

      console.error("Failed to load transactions", error);
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   refreshTransactions();
  // }, []);

  const addTransaction = async (data: any) => {
    await createTransaction(data);
    await refreshTransactions();
  };

  const editTransaction = async (id: string, data: any) => {
    await updateTransaction(id, data);
    await refreshTransactions();
  };

  const deleteTransaction = async (id: string) => {
    await deleteTransactionApi(id);
    await refreshTransactions();
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        loading,
        refreshTransactions,
        addTransaction,
        editTransaction,
        deleteTransaction,
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

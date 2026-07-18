import React, { createContext, useContext } from "react";
import {
  createTransaction,
  updateTransaction,
  deleteTransaction as deleteTransactionApi,
} from "@/services/transaction.service";

type TransactionContextType = {
  // The transactions list is managed locally in the tab with full pagination.
  // This context only provides mutation helpers consumed by add/import screens.
  refreshTransactions: () => Promise<void>;
  addTransaction: (data: any) => Promise<void>;
  editTransaction: (id: string, data: any) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
};

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  // No-op: the transactions tab refreshes itself via useFocusEffect on navigation.
  const refreshTransactions = async () => {};

  const addTransaction = async (data: any) => {
    await createTransaction(data);
  };

  const editTransaction = async (id: string, data: any) => {
    await updateTransaction(id, data);
  };

  const deleteTransaction = async (id: string) => {
    await deleteTransactionApi(id);
  };

  return (
    <TransactionContext.Provider
      value={{ refreshTransactions, addTransaction, editTransaction, deleteTransaction }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (!context) throw new Error("useTransactions must be used inside TransactionProvider");
  return context;
}

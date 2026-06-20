import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

import { Invoice } from "../data/invoices";

type InvoiceContextType = {
  invoices: Invoice[];
  addInvoice: (invoice: Invoice) => void;
  deleteInvoice: (id: number) => void;
};

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export function InvoiceProvider({ children }: { children: React.ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadInvoices = async () => {
      const stored = await AsyncStorage.getItem("invoices");

      if (stored) {
        setInvoices(JSON.parse(stored));
      }

      setLoaded(true);
    };

    loadInvoices();
  }, []);

  useEffect(() => {
    if (!loaded) return;

    AsyncStorage.setItem("invoices", JSON.stringify(invoices));
  }, [invoices, loaded]);

  const addInvoice = (invoice: Invoice) => {
    setInvoices((prev) => [...prev, invoice]);
  };

  const deleteInvoice = (id: number) => {
    setInvoices((prev) => prev.filter((invoice) => invoice.id !== id));
  };

  return (
    <InvoiceContext.Provider
      value={{
        invoices,
        addInvoice,
        deleteInvoice,
      }}
    >
      {children}
    </InvoiceContext.Provider>
  );
}

export function useInvoices() {
  const context = useContext(InvoiceContext);

  if (!context) {
    throw new Error("useInvoices must be used inside InvoiceProvider");
  }

  return context;
}

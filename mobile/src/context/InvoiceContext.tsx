import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

export type InvoiceStatus =
  | "Draft"
  | "Sent"
  | "Paid"
  | "Overdue";

export type Invoice = {
  id: number;
  customerName: string;
  invoiceNumber: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
};

type InvoiceContextType = {
  invoices: Invoice[];

  addInvoice: (invoice: Invoice) => void;

  deleteInvoice: (id: number) => void;

  updateInvoiceStatus: (
    id: number,
    status: InvoiceStatus
  ) => void;
};

const InvoiceContext = createContext<
  InvoiceContextType | undefined
>(undefined);

export function InvoiceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [invoices, setInvoices] =
    useState<Invoice[]>([]);

  const [loaded, setLoaded] =
    useState(false);

  // Load invoices

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        const stored =
          await AsyncStorage.getItem(
            "invoices"
          );

        if (stored) {
          setInvoices(JSON.parse(stored));
        }

        setLoaded(true);
      } catch (error) {
        console.error(
          "Failed to load invoices",
          error
        );

        setLoaded(true);
      }
    };

    loadInvoices();
  }, []);

  // Save invoices

  useEffect(() => {
    if (!loaded) return;

    AsyncStorage.setItem(
      "invoices",
      JSON.stringify(invoices)
    );
  }, [invoices, loaded]);

  // Add invoice

  const addInvoice = (
    invoice: Invoice
  ) => {
    setInvoices((prev) => [
      ...prev,
      invoice,
    ]);
  };

  // Delete invoice

  const deleteInvoice = (
    id: number
  ) => {
    setInvoices((prev) =>
      prev.filter(
        (invoice) => invoice.id !== id
      )
    );
  };

  // Update invoice status

  const updateInvoiceStatus = (
    id: number,
    status: InvoiceStatus
  ) => {
    setInvoices((prev) =>
      prev.map((invoice) =>
        invoice.id === id
          ? {
              ...invoice,
              status,
            }
          : invoice
      )
    );
  };

  return (
    <InvoiceContext.Provider
      value={{
        invoices,
        addInvoice,
        deleteInvoice,
        updateInvoiceStatus,
      }}
    >
      {children}
    </InvoiceContext.Provider>
  );
}

export function useInvoices() {
  const context =
    useContext(InvoiceContext);

  if (!context) {
    throw new Error(
      "useInvoices must be used inside InvoiceProvider"
    );
  }

  return context;
}


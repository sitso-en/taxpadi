import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getInvoices,
  getInvoiceStats,
  createInvoice,
  markInvoicePaid,
  cancelInvoice,
  sendInvoice,
} from "@/services/invoices.service";
import { readCache, writeCache } from "@/utils/cache";

const CACHE_KEY = "taxpadi:invoices";
const CACHE_TTL = 5 * 60 * 1000;

export type InvoiceStatus = "unpaid" | "paid" | "cancelled";

export type Invoice = {
  id: string;
  invoiceRef: string;
  customerName: string;
  amount: number;
  dueDate: string;
  createdAt: string;
  status: InvoiceStatus;
  daysUntilDue: number;
};

type CacheShape = { invoices: Invoice[]; stats: any };

type InvoiceContextType = {
  invoices: Invoice[];
  stats: any | null;
  loading: boolean;
  error: boolean;
  refreshInvoices: (showLoader?: boolean) => Promise<void>;
  addInvoice: (data: {
    client_name: string;
    client_email?: string;
    client_phone?: string;
    description: string;
    subtotal: number;
    due_date?: string;
  }) => Promise<any>;
  markPaid: (id: string) => Promise<void>;
  cancel: (id: string) => Promise<void>;
  send: (id: string, channel: "email" | "whatsapp" | "download") => Promise<any>;
};

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

function mapInvoice(item: any): Invoice {
  const daysUntilDue = item.due_date
    ? Math.ceil((new Date(item.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;
  return {
    id: item.invoice_id,
    invoiceRef: item.invoice_ref,
    customerName: item.client_name,
    amount: item.total_amount,
    dueDate: item.due_date,
    createdAt: item.created_at,
    status: item.status,
    daysUntilDue,
  };
}

export function InvoiceProvider({ children }: { children: React.ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const doFetch = async (silent = false) => {
    if (!silent) setError(false);
    try {
      const [listRes, statsRes] = await Promise.all([getInvoices(), getInvoiceStats()]);
      const mapped = (listRes.data?.invoices ?? []).map(mapInvoice);
      const freshStats = statsRes.data ?? null;
      setInvoices(mapped);
      setStats(freshStats);
      setError(false);
      writeCache<CacheShape>(CACHE_KEY, { invoices: mapped, stats: freshStats });
    } catch {
      if (!silent) setError(true);
    }
  };

  const refreshInvoices = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    await doFetch(false);
    if (showLoader) setLoading(false);
  };

  useEffect(() => {
    readCache<CacheShape>(CACHE_KEY, CACHE_TTL).then(async (cached) => {
      if (cached) {
        setInvoices(cached.data.invoices);
        setStats(cached.data.stats);
        setLoading(false);
        if (cached.isStale) doFetch(true);
      } else {
        await doFetch(false);
        setLoading(false);
      }
    });
  }, []);

  const addInvoice = async (data: {
    client_name: string;
    client_email?: string;
    client_phone?: string;
    description: string;
    subtotal: number;
    due_date?: string;
  }) => {
    const res = await createInvoice(data);
    await refreshInvoices();
    return res;
  };

  const markPaid = async (id: string) => {
    await markInvoicePaid(id);
    setInvoices((prev) => prev.map((inv) => (inv.id === id ? { ...inv, status: "paid" } : inv)));
  };

  const cancel = async (id: string) => {
    await cancelInvoice(id);
    setInvoices((prev) => prev.map((inv) => (inv.id === id ? { ...inv, status: "cancelled" } : inv)));
  };

  const send = async (id: string, channel: "email" | "whatsapp" | "download") =>
    sendInvoice(id, channel);

  return (
    <InvoiceContext.Provider
      value={{ invoices, stats, loading, error, refreshInvoices, addInvoice, markPaid, cancel, send }}
    >
      {children}
    </InvoiceContext.Provider>
  );
}

export function useInvoices() {
  const context = useContext(InvoiceContext);
  if (!context) throw new Error("useInvoices must be used inside InvoiceProvider");
  return context;
}

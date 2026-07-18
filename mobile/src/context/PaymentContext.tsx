import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getPayments,
  initiatePayment,
  getPaymentStatus,
  getPaymentCertificate,
} from "@/services/payment.service";
import { readCache, writeCache } from "@/utils/cache";

const CACHE_KEY = "taxpadi:payments";
const CACHE_TTL = 5 * 60 * 1000;

type PaymentContextType = {
  payments: any[];
  loading: boolean;
  error: boolean;
  refreshPayments: (showLoader?: boolean) => Promise<void>;
  createPayment: (data: any) => Promise<any>;
  checkPaymentStatus: (id: string) => Promise<any>;
  getCertificate: (id: string) => Promise<any>;
};

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export function PaymentProvider({ children }: { children: React.ReactNode }) {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const doFetch = async (silent = false) => {
    if (!silent) setError(false);
    try {
      const response = await getPayments();
      const data = response.data?.payments ?? response.payments ?? [];
      setPayments(data);
      setError(false);
      writeCache(CACHE_KEY, data);
    } catch {
      if (!silent) setError(true);
    }
  };

  const refreshPayments = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    await doFetch(false);
    if (showLoader) setLoading(false);
  };

  useEffect(() => {
    readCache<any[]>(CACHE_KEY, CACHE_TTL).then(async (cached) => {
      if (cached) {
        setPayments(cached.data);
        setLoading(false);
        if (cached.isStale) doFetch(true);
      } else {
        await doFetch(false);
        setLoading(false);
      }
    });
  }, []);

  const createPayment = async (data: any) => {
    const response = await initiatePayment(data);
    await refreshPayments();
    return response;
  };

  const checkPaymentStatus = async (id: string) => getPaymentStatus(id);

  const getCertificate = async (id: string) => getPaymentCertificate(id);

  return (
    <PaymentContext.Provider
      value={{ payments, loading, error, refreshPayments, createPayment, checkPaymentStatus, getCertificate }}
    >
      {children}
    </PaymentContext.Provider>
  );
}

export function usePayments() {
  const context = useContext(PaymentContext);
  if (!context) throw new Error("usePayments must be used inside PaymentProvider");
  return context;
}

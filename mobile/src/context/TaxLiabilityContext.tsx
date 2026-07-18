import React, { createContext, useContext, useEffect, useState } from "react";
import { getTaxLiability, recalculateTaxLiability } from "@/services/tax.service";
import { readCache, writeCache } from "@/utils/cache";

const CACHE_KEY = "taxpadi:tax-liability";
const CACHE_TTL = 5 * 60 * 1000;

export type LiabilityData = {
  taxable_income?: number;
  total_deductions?: number;
  tax_liability?: number;
  total_liability?: number;
  total_amount_paid?: number;
  net_liability?: number;
  tax_year?: number;
  breakdown?: any;
  next_deadline?: string;
};

type TaxLiabilityContextType = {
  liability: LiabilityData | null;
  loading: boolean;
  error: boolean;
  refreshLiability: (showLoader?: boolean) => Promise<void>;
  recalculate: () => Promise<void>;
};

const TaxLiabilityContext = createContext<TaxLiabilityContextType | undefined>(undefined);

export function TaxLiabilityProvider({ children }: { children: React.ReactNode }) {
  const [liability, setLiability] = useState<LiabilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const doFetch = async (silent = false) => {
    if (!silent) setError(false);
    try {
      const res = await getTaxLiability();
      const data = res.data ?? res;
      setLiability(data);
      setError(false);
      writeCache(CACHE_KEY, data);
    } catch {
      if (!silent) setError(true);
    }
  };

  const refreshLiability = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    await doFetch(false);
    if (showLoader) setLoading(false);
  };

  useEffect(() => {
    readCache<LiabilityData>(CACHE_KEY, CACHE_TTL).then(async (cached) => {
      if (cached) {
        setLiability(cached.data);
        setLoading(false);
        if (cached.isStale) doFetch(true);
      } else {
        await doFetch(false);
        setLoading(false);
      }
    });
  }, []);

  const recalculate = async () => {
    const res = await recalculateTaxLiability();
    const data = res.data ?? res;
    setLiability(data);
    writeCache(CACHE_KEY, data);
  };

  return (
    <TaxLiabilityContext.Provider value={{ liability, loading, error, refreshLiability, recalculate }}>
      {children}
    </TaxLiabilityContext.Provider>
  );
}

export function useTaxLiability() {
  const ctx = useContext(TaxLiabilityContext);
  if (!ctx) throw new Error("useTaxLiability must be used inside TaxLiabilityProvider");
  return ctx;
}

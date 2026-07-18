import React, { createContext, useContext, useEffect, useState } from "react";
import { getTaxReturns } from "@/services/taxReturns.service";

export type TaxReturn = {
  id: string;
  taxType: string;
  taxYear: number;
  periodStart: string;
  periodEnd: string;
  taxLiability: number;
  status: "draft" | "submitted";
  submittedAt: string | null;
  graReference: string | null;
  createdAt: string;
};

type TaxReturnsContextType = {
  returns: TaxReturn[];
  loading: boolean;
  refreshReturns: () => Promise<void>;
};

const TaxReturnsContext = createContext<TaxReturnsContextType>({} as TaxReturnsContextType);

function mapReturn(item: any): TaxReturn {
  return {
    id: item.returnId,
    taxType: item.taxType,
    taxYear: item.taxYear,
    periodStart: item.periodStart,
    periodEnd: item.periodEnd,
    taxLiability: Number(item.taxLiability ?? 0),
    status: item.status,
    submittedAt: item.submittedAt ?? null,
    graReference: item.graReference ?? null,
    createdAt: item.createdAt,
  };
}

export function TaxReturnsProvider({ children }: { children: React.ReactNode }) {
  const [returns, setReturns] = useState<TaxReturn[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshReturns = async () => {
    setLoading(true);
    try {
      const res = await getTaxReturns();
      setReturns((res.data?.returns ?? []).map(mapReturn));
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshReturns();
  }, []);

  return (
    <TaxReturnsContext.Provider value={{ returns, loading, refreshReturns }}>
      {children}
    </TaxReturnsContext.Provider>
  );
}

export function useTaxReturns() {
  return useContext(TaxReturnsContext);
}

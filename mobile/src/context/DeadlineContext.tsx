import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getDeadlines, completeDeadline } from "@/services/deadlines.service";
import { getPenalties } from "@/services/penalty.service";
import { Penalty } from "@/types/penalty";
import { readCache, writeCache } from "@/utils/cache";

const CACHE_KEY = "taxpadi:deadlines";
const CACHE_TTL = 10 * 60 * 1000;

export type Deadline = {
  id: string;
  title: string;
  authority: string;
  dueDate: string;
  completed: boolean;
  daysUntilDue: number;
  taxType: string;
  periodStart: string;
  periodEnd: string;
};

type CacheShape = { deadlines: Deadline[]; penalties: Penalty[] };

type DeadlineContextType = {
  deadlines: Deadline[];
  penalties: Penalty[];
  loading: boolean;
  error: boolean;
  toggleDeadline: (deadline: Deadline) => Promise<void>;
  refreshDeadlines: (showLoader?: boolean) => Promise<void>;
  upcomingCount: number;
  overdueCount: number;
};

const DeadlineContext = createContext<DeadlineContextType>({} as DeadlineContextType);

const TAX_TYPE_LABELS: Record<string, string> = {
  income_tax: "Income Tax",
  vat: "VAT",
  paye: "PAYE",
  withholding: "Withholding Tax",
  corporate_tax: "Corporate Tax",
};

function mapDeadline(item: any): Deadline {
  const daysUntilDue =
    item.days_until_due != null
      ? item.days_until_due
      : item.deadline_date
      ? Math.ceil((new Date(item.deadline_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : 0;
  return {
    id: item.deadline_id,
    title: item.title,
    authority: TAX_TYPE_LABELS[item.tax_type] ?? "Ghana Revenue Authority",
    dueDate: item.deadline_date,
    completed: item.completed,
    daysUntilDue,
    taxType: item.tax_type,
    periodStart: item.period_start,
    periodEnd: item.period_end,
  };
}

export function DeadlineProvider({ children }: { children: React.ReactNode }) {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const doFetch = async (silent = false) => {
    if (!silent) setError(false);
    try {
      const [deadlinesRes, fetchedPenalties] = await Promise.all([
        getDeadlines(),
        getPenalties().catch(() => [] as Penalty[]),
      ]);
      const mapped = (deadlinesRes.data?.deadlines ?? []).map(mapDeadline);
      setDeadlines(mapped);
      setPenalties(fetchedPenalties);
      setError(false);
      writeCache<CacheShape>(CACHE_KEY, { deadlines: mapped, penalties: fetchedPenalties });
    } catch {
      if (!silent) setError(true);
    }
  };

  const refreshDeadlines = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    await doFetch(false);
    if (showLoader) setLoading(false);
  };

  useEffect(() => {
    readCache<CacheShape>(CACHE_KEY, CACHE_TTL).then(async (cached) => {
      if (cached) {
        setDeadlines(cached.data.deadlines);
        setPenalties(cached.data.penalties);
        setLoading(false);
        if (cached.isStale) doFetch(true);
      } else {
        await doFetch(false);
        setLoading(false);
      }
    });
  }, []);

  const toggleDeadline = async (deadline: Deadline) => {
    setDeadlines((prev) => prev.map((d) => (d.id === deadline.id ? { ...d, completed: true } : d)));
    try {
      await completeDeadline(deadline.id, deadline.taxType, deadline.periodStart, deadline.periodEnd);
    } catch (e) {
      setDeadlines((prev) => prev.map((d) => (d.id === deadline.id ? { ...d, completed: false } : d)));
      throw e;
    }
  };

  const upcomingCount = useMemo(
    () => deadlines.filter((d) => !d.completed && d.daysUntilDue >= 0).length,
    [deadlines]
  );

  const overdueCount = useMemo(
    () => deadlines.filter((d) => !d.completed && d.daysUntilDue < 0).length,
    [deadlines]
  );

  return (
    <DeadlineContext.Provider
      value={{ deadlines, penalties, loading, error, toggleDeadline, refreshDeadlines, upcomingCount, overdueCount }}
    >
      {children}
    </DeadlineContext.Provider>
  );
}

export function useDeadlines() {
  return useContext(DeadlineContext);
}

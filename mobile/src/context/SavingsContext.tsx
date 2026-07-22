import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getVault,
  getVaultTransactions,
  getVaultSuggestion,
  contributeToVault,
  linkMomo as linkMomoService,
} from "@/services/vault.service";
import { readCache, writeCache } from "@/utils/cache";

const CACHE_KEY = "taxpadi:savings";
const CACHE_TTL = 5 * 60 * 1000;

type CacheShape = { vault: any; transactions: any[]; suggestion: any };

type SavingsContextType = {
  vault: any;
  totalSaved: number;
  transactions: any[];
  suggestion: any;
  loading: boolean;
  error: boolean;
  refreshVault: (showLoader?: boolean) => Promise<void>;
  contribute: (amount: number, trigger: "manual" | "suggested") => Promise<any>;
  linkMomo: (data: { momo_number: string; momo_provider: "mtn" | "telecel" | "airteltigo" }) => Promise<any>;
};

const SavingsContext = createContext({} as SavingsContextType);

export function SavingsProvider({ children }: { children: React.ReactNode }) {
  const [vault, setVault] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [suggestion, setSuggestion] = useState<any>(null);
  const [effectiveBalance, setEffectiveBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const doFetch = async (silent = false) => {
    if (!silent) setError(false);

    // Vault + suggestion fetched independently so a missing vault doesn't kill the suggestion
    const [vaultRes, txRes] = await Promise.allSettled([getVault(), getVaultTransactions()]);

    const freshVault = vaultRes.status === "fulfilled" ? (vaultRes.value.data ?? null) : null;
    const freshTx = txRes.status === "fulfilled" ? (txRes.value.data?.transactions ?? []) : [];

    if (vaultRes.status === "rejected" && txRes.status === "rejected") {
      if (!silent) setError(true);
    } else {
      setError(false);
    }

    setVault(freshVault);
    setTransactions(freshTx);

    const txBalance = freshTx
      .filter((t: any) => t.status === "SUCCESSFUL")
      .reduce((sum: number, t: any) => {
        const amt = parseFloat(t.amount) || 0;
        return t.type === "DEPOSIT" ? sum + amt : sum - amt;
      }, 0);
    const computedBalance = (freshVault?.balance > 0) ? freshVault.balance : Math.max(0, txBalance);
    setEffectiveBalance(computedBalance);

    let freshSuggestion = null;
    try {
      const sugRes = await getVaultSuggestion();
      freshSuggestion = sugRes.data ?? null;
    } catch {}
    setSuggestion(freshSuggestion);

    writeCache<CacheShape>(CACHE_KEY, { vault: freshVault, transactions: freshTx, suggestion: freshSuggestion });
  };

  const refreshVault = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    await doFetch(false);
    if (showLoader) setLoading(false);
  };

  useEffect(() => {
    readCache<CacheShape>(CACHE_KEY, CACHE_TTL).then(async (cached) => {
      if (cached) {
        const cachedVault = cached.data.vault;
        const cachedTx = cached.data.transactions ?? [];
        setVault(cachedVault);
        setTransactions(cachedTx);
        setSuggestion(cached.data.suggestion);
        // Compute effectiveBalance from cached data so subtitles/stats show immediately
        const txBalance = cachedTx
          .filter((t: any) => t.status === "SUCCESSFUL")
          .reduce((sum: number, t: any) => {
            const amt = parseFloat(t.amount) || 0;
            return t.type === "DEPOSIT" ? sum + amt : sum - amt;
          }, 0);
        setEffectiveBalance(
          cachedVault?.balance > 0 ? cachedVault.balance : Math.max(0, txBalance)
        );
        setLoading(false);
        if (cached.isStale) doFetch(true);
      } else {
        await doFetch(false);
        setLoading(false);
      }
    });
  }, []);

  const contribute = async (amount: number, trigger: "manual" | "suggested") => {
    const res = await contributeToVault({ amount, trigger });
    await refreshVault();
    return res;
  };

  const linkMomo = async (data: { momo_number: string; momo_provider: "mtn" | "telecel" | "airteltigo" }) => {
    const res = await linkMomoService(data);
    await refreshVault();
    return res;
  };

  return (
    <SavingsContext.Provider
      value={{
        vault,
        totalSaved: effectiveBalance,
        transactions,
        suggestion,
        loading,
        error,
        refreshVault,
        contribute,
        linkMomo,
      }}
    >
      {children}
    </SavingsContext.Provider>
  );
}

export function useSavings() {
  return useContext(SavingsContext);
}

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Saving = {
  id: number;
  amount: number;
  date: string;
};

type SavingsContextType = {
  savings: Saving[];
  totalSaved: number;
  loading: boolean;
  refreshSavings: () => Promise<void>;
  addSaving: (amount: number) => Promise<void>;
  deleteSaving: (id: number) => Promise<void>;
};

const SavingsContext =
  createContext({} as SavingsContextType);

export function SavingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [savings, setSavings] = useState<Saving[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshSavings = async () => {
    setLoading(false);

    // TODO: Replace when Savings endpoints exist
    setSavings([]);

    setLoading(false);
  };

  useEffect(() => {
    refreshSavings();
  }, []);

  const addSaving = async (amount: number) => {
    // TODO: Call backend when endpoint is available

    const saving: Saving = {
      id: Date.now(),
      amount,
      date: new Date().toISOString(),
    };

    setSavings((prev) => [...prev, saving]);
  };

  const deleteSaving = async (id: number) => {
    // TODO: Call backend when endpoint is available

    setSavings((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  const totalSaved = useMemo(
    () =>
      savings.reduce(
        (sum, item) => sum + item.amount,
        0
      ),
    [savings]
  );

  return (
    <SavingsContext.Provider
      value={{
        savings,
        totalSaved,
        loading,
        refreshSavings,
        addSaving,
        deleteSaving,
      }}
    >
      {children}
    </SavingsContext.Provider>
  );
}

export function useSavings() {
  return useContext(SavingsContext);
}
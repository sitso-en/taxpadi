import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Saving = {
  id: number;
  amount: number;
  date: string;
};

type SavingsContextType = {
  savings: Saving[];
  totalSaved: number;

  addSaving: (amount: number) => void;

  deleteSaving: (id: number) => void;
};

const SavingsContext =
  createContext<SavingsContextType>(
    {} as SavingsContextType
  );

export function SavingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [savings, setSavings] =
    useState<Saving[]>([]);

  const [loaded, setLoaded] =
    useState(false);

  // Load savings

  useEffect(() => {
    const loadSavings = async () => {
      try {
        const stored =
          await AsyncStorage.getItem(
            "savings"
          );

        if (stored) {
          setSavings(JSON.parse(stored));
        }

        setLoaded(true);
      } catch (error) {
        console.log(
          "Failed to load savings",
          error
        );

        setLoaded(true);
      }
    };

    loadSavings();
  }, []);

  // Save savings

  useEffect(() => {
    if (!loaded) return;

    AsyncStorage.setItem(
      "savings",
      JSON.stringify(savings)
    );
  }, [savings, loaded]);

  // Total saved

  const totalSaved = useMemo(
    () =>
      savings.reduce(
        (sum, saving) =>
          sum + saving.amount,
        0
      ),
    [savings]
  );

  // Add saving

  const addSaving = (
    amount: number
  ) => {
    setSavings((prev) => [
      ...prev,
      {
        id: Date.now(),
        amount,
        date:
          new Date().toISOString(),
      },
    ]);
  };

  // Delete saving

  const deleteSaving = (
  id: number
) => {
  console.log("Deleting ID:", id);

  setSavings((prev) => {
    console.log(
      "Savings before:",
      prev
    );

    const updated = prev.filter(
      (saving) =>
        Number(saving.id) !==
        Number(id)
    );

    console.log(
      "Savings after:",
      updated
    );

    return updated;
  });
};
  return (
    <SavingsContext.Provider
      value={{
        savings,
        totalSaved,
        addSaving,
        deleteSaving,
      }}
    >
      {children}
    </SavingsContext.Provider>
  );
}

export function useSavings() {
  return useContext(
    SavingsContext
  );
}
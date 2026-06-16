import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { TaxReturn } from "../data/returns";

type ReturnContextType = {
  returns: TaxReturn[];
  addReturn: (taxReturn: TaxReturn) => void;
  deleteReturn: (id: number) => void;
  editReturn: (taxReturn: TaxReturn) => void;
};

const ReturnContext = createContext<ReturnContextType | undefined>(undefined);

export function ReturnProvider({ children }: { children: React.ReactNode }) {
  const [returns, setReturns] = useState<TaxReturn[]>([]);
  const [loaded, setLoaded] = useState(false);

  const addReturn = (taxReturn: TaxReturn) => {
    setReturns((prev) => [...prev, taxReturn]);
  };
  const deleteReturn = (id: number) => {
    setReturns((prev) => prev.filter((taxReturn) => taxReturn.id !== id));
  };

  const editReturn = (updatedReturn: TaxReturn) => {
    setReturns((prev) =>
      prev.map((taxReturn) =>
        taxReturn.id === updatedReturn.id ? updatedReturn : taxReturn,
      ),
    );
  };
  useEffect(() => {
    const loadReturns = async () => {
      try {
        const stored = await AsyncStorage.getItem("returns");

        if (stored) {
          setReturns(JSON.parse(stored));
        }

        setLoaded(true);
      } catch (error) {
        console.error("Failed to load returns", error);
        setLoaded(true);
      }
    };

    loadReturns();
  }, []);
  useEffect(() => {
    if (!loaded) return;

    AsyncStorage.setItem("returns", JSON.stringify(returns));
  }, [returns, loaded]);

  return (
    <ReturnContext.Provider
      value={{
        returns,
        addReturn,
        deleteReturn,
        editReturn,
      }}
    >
      {children}
    </ReturnContext.Provider>
  );
}

export function useReturns() {
  const context = useContext(ReturnContext);

  if (!context) {
    throw new Error("useReturns must be used inside ReturnProvider");
  }

  return context;
}

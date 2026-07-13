import React, { createContext, useContext, useState } from "react";
import { TaxReturn } from "../data/returns";

type ReturnContextType = {
  returns: TaxReturn[];
  loading: boolean;
  addReturn: (taxReturn: TaxReturn) => Promise<void>;
  deleteReturn: (id: number) => Promise<void>;
  editReturn: (taxReturn: TaxReturn) => Promise<void>;
};

const ReturnContext = createContext<ReturnContextType | undefined>(undefined);

export function ReturnProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [returns, setReturns] = useState<TaxReturn[]>([]);
  const [loading] = useState(false);

  const addReturn = async (taxReturn: TaxReturn) => {
    setReturns((prev) => [...prev, taxReturn]);
  };

  const deleteReturn = async (id: number) => {
    setReturns((prev) =>
      prev.filter((taxReturn) => taxReturn.id !== id)
    );
  };

  const editReturn = async (updatedReturn: TaxReturn) => {
    setReturns((prev) =>
      prev.map((taxReturn) =>
        taxReturn.id === updatedReturn.id
          ? updatedReturn
          : taxReturn
      )
    );
  };

  return (
    <ReturnContext.Provider
      value={{
        returns,
        loading,
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
    throw new Error(
      "useReturns must be used inside ReturnProvider"
    );
  }

  return context;
}
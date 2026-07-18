import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "@taxpadi_amounts_hidden";

interface PrivacyContextType {
  amountsHidden: boolean;
  toggleAmountsHidden: () => void;
  resetPrivacy: () => void;
}

const PrivacyContext = createContext<PrivacyContextType>({
  amountsHidden: true,
  toggleAmountsHidden: () => {},
  resetPrivacy: () => {},
});

export function PrivacyProvider({ children }: { children: React.ReactNode }) {
  const [amountsHidden, setAmountsHidden] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      if (value !== null) {
        setAmountsHidden(value === "true");
      }
    });
  }, []);

  const toggleAmountsHidden = () => {
    setAmountsHidden((prev) => {
      const next = !prev;
      AsyncStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  };

  const resetPrivacy = () => {
    setAmountsHidden(true);
    AsyncStorage.setItem(STORAGE_KEY, "true");
  };

  return (
    <PrivacyContext.Provider value={{ amountsHidden, toggleAmountsHidden, resetPrivacy }}>
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacy() {
  return useContext(PrivacyContext);
}

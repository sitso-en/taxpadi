import React, {
  createContext,
  useContext,
  useState,
} from "react";

type Language =
  | "English"
  | "Twi"
  | "French";

type LanguageContextType = {
  language: Language;
  setLanguage: (
    language: Language
  ) => void;
};

const LanguageContext =
  createContext<
    LanguageContextType | undefined
  >(undefined);

export function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [language, setLanguage] =
    useState<Language>("English");

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context =
    useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider"
    );
  }

  return context;
}
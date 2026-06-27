import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

export type FilingStep = {
  step: number;
  title: string;
  completed: boolean;
};

export type TaxReturn = {
  id: number;
  taxYear: string;
  filedDate: string;
  status: "Filed" | "Pending";
};

type TaxReturnsContextType = {
  currentReturnFiled: boolean;

  filingSteps: FilingStep[];

  previousReturns: TaxReturn[];

  fileCurrentReturn: () => void;

  toggleStep: (step: number) => void;

  resetCurrentReturn: () => void;
};

const TaxReturnsContext =
  createContext<TaxReturnsContextType>(
    {} as TaxReturnsContextType
  );

export function TaxReturnsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [
    currentReturnFiled,
    setCurrentReturnFiled,
  ] = useState(false);

  const [
    previousReturns,
    setPreviousReturns,
  ] = useState<TaxReturn[]>([]);

  const [loaded, setLoaded] =
    useState(false);

  const [
    filingSteps,
    setFilingSteps,
  ] = useState<FilingStep[]>([
    {
      step: 1,
      title: "Verify Tax Profile",
      completed: false,
    },

    {
      step: 2,
      title:
        "Review Income & Expenses",
      completed: false,
    },

    {
      step: 3,
      title:
        "Calculate Final Liability",
      completed: false,
    },

    {
      step: 4,
      title: "Submit Return",
      completed: false,
    },

    {
      step: 5,
      title:
        "Pay Outstanding Balance",
      completed: false,
    },
  ]);

  // Load saved data

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedReturns =
          await AsyncStorage.getItem(
            "taxReturns"
          );

        const storedSteps =
          await AsyncStorage.getItem(
            "filingSteps"
          );

        const storedFiled =
          await AsyncStorage.getItem(
            "currentReturnFiled"
          );

        if (storedReturns) {
          setPreviousReturns(
            JSON.parse(storedReturns)
          );
        }

        if (storedSteps) {
          setFilingSteps(
            JSON.parse(storedSteps)
          );
        }

        if (storedFiled) {
          setCurrentReturnFiled(
            JSON.parse(storedFiled)
          );
        }

        setLoaded(true);
      } catch (error) {
        console.log(
          "Failed to load tax returns:",
          error
        );

        setLoaded(true);
      }
    };

    loadData();
  }, []);

  // Save data whenever state changes

  useEffect(() => {
    if (!loaded) return;

    AsyncStorage.setItem(
      "taxReturns",
      JSON.stringify(previousReturns)
    );

    AsyncStorage.setItem(
      "filingSteps",
      JSON.stringify(filingSteps)
    );

    AsyncStorage.setItem(
      "currentReturnFiled",
      JSON.stringify(
        currentReturnFiled
      )
    );
  }, [
    previousReturns,
    filingSteps,
    currentReturnFiled,
    loaded,
  ]);

  // Toggle step completion

  const toggleStep = (
    step: number
  ) => {
    if (currentReturnFiled) return;

    setFilingSteps((prev) =>
      prev.map((item) =>
        item.step === step
          ? {
              ...item,
              completed:
                !item.completed,
            }
          : item
      )
    );
  };

  // File current return

  const fileCurrentReturn = () => {
    const allDone =
      filingSteps.every(
        (step) => step.completed
      );

    // Cannot file unless all
    // steps are completed

    if (!allDone) return;

    // Prevent duplicate filing

    if (currentReturnFiled)
      return;

    const now = new Date();

    const taxYear = `FY ${now.getFullYear()}/${
      now.getFullYear() + 1
    }`;

    setCurrentReturnFiled(true);

    setPreviousReturns((prev) => [
      {
        id: Date.now(),
        taxYear,
        filedDate:
          now.toISOString(),
        status: "Filed",
      },

      ...prev,
    ]);
  };

  // Reset current return
  // (useful for testing)

  const resetCurrentReturn =
    () => {
      setCurrentReturnFiled(
        false
      );

      setFilingSteps((prev) =>
        prev.map((step) => ({
          ...step,
          completed: false,
        }))
      );
    };

  return (
    <TaxReturnsContext.Provider
      value={{
        currentReturnFiled,

        filingSteps,

        previousReturns,

        fileCurrentReturn,

        toggleStep,

        resetCurrentReturn,
      }}
    >
      {children}
    </TaxReturnsContext.Provider>
  );
}

export function useTaxReturns() {
  return useContext(
    TaxReturnsContext
  );
}
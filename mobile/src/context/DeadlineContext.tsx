import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Deadline = {
  id: number;
  title: string;
  authority: string;
  dueDate: string;
  completed: boolean;
};

type DeadlineContextType = {
  deadlines: Deadline[];

  addDeadline: (
    title: string,
    authority: string,
    dueDate: string
  ) => void;

  deleteDeadline: (id: number) => void;

  toggleDeadline: (id: number) => void;

  upcomingCount: number;

  overdueCount: number;
};

const DeadlineContext =
  createContext<DeadlineContextType>(
    {} as DeadlineContextType
  );

export function DeadlineProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [deadlines, setDeadlines] =
    useState<Deadline[]>([]);

  const [loaded, setLoaded] =
    useState(false);

  // Load stored deadlines

  useEffect(() => {
    const loadDeadlines =
      async () => {
        try {
          const stored =
            await AsyncStorage.getItem(
              "deadlines"
            );

          if (stored) {
            setDeadlines(
              JSON.parse(stored)
            );
          } else {
            generateDefaultDeadlines();
          }

          setLoaded(true);
        } catch (error) {
          console.log(
            "Failed loading deadlines",
            error
          );

          generateDefaultDeadlines();

          setLoaded(true);
        }
      };

    loadDeadlines();
  }, []);

  // Save deadlines

  useEffect(() => {
    if (!loaded) return;

    AsyncStorage.setItem(
      "deadlines",
      JSON.stringify(deadlines)
    );
  }, [deadlines, loaded]);

  // Generate yearly deadlines

  const generateDefaultDeadlines =
    () => {
      const year =
        new Date().getFullYear();

      const currentMonth =
        new Date().getMonth();

      const defaultDeadlines: Deadline[] =
        [
          {
            id: 1,
            title: "PAYE Filing",
            authority:
              "Ghana Revenue Authority",

            dueDate: new Date(
              year,
              currentMonth + 1,
              15
            ).toISOString(),

            completed: false,
          },

          {
            id: 2,
            title: "VAT Return",
            authority:
              "Ghana Revenue Authority",

            dueDate: new Date(
              year,
              currentMonth + 1,
              28
            ).toISOString(),

            completed: false,
          },

          {
            id: 3,
            title:
              "Annual Income Tax",

            authority:
              "Ghana Revenue Authority",

            dueDate: new Date(
              year,
              3,
              30
            ).toISOString(),

            completed: false,
          },
        ];

      setDeadlines(defaultDeadlines);
    };

  // Add deadline

  const addDeadline = (
    title: string,
    authority: string,
    dueDate: string
  ) => {
    setDeadlines((prev) => [
      ...prev,
      {
        id: Date.now(),
        title,
        authority,
        dueDate,
        completed: false,
      },
    ]);
  };

  // Delete deadline

  const deleteDeadline = (
    id: number
  ) => {
    setDeadlines((prev) =>
      prev.filter(
        (deadline) =>
          deadline.id !== id
      )
    );
  };

  // Complete deadline

  const toggleDeadline = (
    id: number
  ) => {
    setDeadlines((prev) =>
      prev.map((deadline) =>
        deadline.id === id
          ? {
              ...deadline,
              completed:
                !deadline.completed,
            }
          : deadline
      )
    );
  };

  // Statistics

  const upcomingCount =
    useMemo(
      () =>
        deadlines.filter(
          (deadline) =>
            !deadline.completed
        ).length,
      [deadlines]
    );

  const overdueCount =
    useMemo(() => {
      return deadlines.filter(
        (deadline) =>
          !deadline.completed &&
          new Date(
            deadline.dueDate
          ) < new Date()
      ).length;
    }, [deadlines]);

  return (
    <DeadlineContext.Provider
      value={{
        deadlines,
        addDeadline,
        deleteDeadline,
        toggleDeadline,
        upcomingCount,
        overdueCount,
      }}
    >
      {children}
    </DeadlineContext.Provider>
  );
}

export function useDeadlines() {
  return useContext(
    DeadlineContext
  );
}
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

export type User = {
  fullName: string;
  phoneNumber: string;
  email: string;
  region: string;
  category: string;
  plan: "FREE" | "PRO";
};

type UserContextType = {
  user: User;

  setUser: (user: User) => void;

  updateUser: (
    updates: Partial<User>
  ) => void;

  loading: boolean;
};

const UserContext =
  createContext<
    UserContextType | undefined
  >(undefined);

const defaultUser: User = {
  fullName: "User",
  phoneNumber: "",
  email: "",
  region: "",
  category: "",
  plan: "FREE",
};

export function UserProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] =
    useState<User>(defaultUser);

  const [loading, setLoading] =
    useState(true);

  // Load saved user data

  useEffect(() => {
    const loadUser =
      async () => {
        try {
          const storedUser =
            await AsyncStorage.getItem(
              "user"
            );

          if (storedUser) {
            setUser(
              JSON.parse(storedUser)
            );
          }
        } catch (error) {
          console.log(
            "Failed to load user:",
            error
          );
        } finally {
          setLoading(false);
        }
      };

    loadUser();
  }, []);

  // Save user whenever it changes

  useEffect(() => {
    if (loading) return;

    const saveUser =
      async () => {
        try {
          await AsyncStorage.setItem(
            "user",
            JSON.stringify(user)
          );
        } catch (error) {
          console.log(
            "Failed to save user:",
            error
          );
        }
      };

    saveUser();
  }, [user, loading]);

  // Update selected fields only

  const updateUser = (
    updates: Partial<User>
  ) => {
    setUser(
      (previousUser) => ({
        ...previousUser,
        ...updates,
      })
    );
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        updateUser,
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context =
    useContext(UserContext);

  if (!context) {
    throw new Error(
      "useUser must be used within UserProvider"
    );
  }

  return context;
}
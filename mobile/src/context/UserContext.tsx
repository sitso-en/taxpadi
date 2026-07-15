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
  
  subscription_tier: string;
  is_active: boolean;

  label: string;
  tin: string;
  taxpayer_category: string;
  active_profile: boolean;
};

type UserContextType = {
  user: User;
  setUser: (user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  loading: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

const defaultUser: User = {
  fullName: "User",
  phoneNumber: "",
  email: "",
  region: "",
  category: "",
  subscription_tier: "FREE",
  is_active: false,
  label: "",
  tin: "",
  taxpayer_category: "",
  active_profile: false,
};

const normalizeStoredUser = (storedUser: Record<string, any> | null | undefined): User => {
  if (!storedUser) {
    return defaultUser;
  }

  const { full_name, fullName, ...rest } = storedUser;

  return {
    ...(rest as Partial<User>),
    fullName: fullName ?? full_name ?? defaultUser.fullName,
    phoneNumber: storedUser.phoneNumber ?? storedUser.phone ?? "",
    email: storedUser.email ?? "",
    region: storedUser.region ?? "",
    category: storedUser.category ?? "",
    subscription_tier: storedUser.subscription_tier ?? "FREE",
    is_active: storedUser.is_active ?? false,
    label: storedUser.label ?? "",
    tin: storedUser.tin ?? "",
    taxpayer_category: storedUser.taxpayer_category ?? "",
    active_profile: storedUser.active_profile ?? false,
  } as User;
};

export function UserProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User>(defaultUser);
  const [loading, setLoading] = useState(true);

  // Load saved user data
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(normalizeStoredUser(parsedUser));
        }
      } catch (error) {
        console.log("Failed to load user:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Save user whenever it changes
  useEffect(() => {
    if (loading) return;

    const saveUser = async () => {
      try {
        const { fullName, ...rest } = user;

        await AsyncStorage.setItem(
          "user",
          JSON.stringify({ ...rest, full_name: fullName })
        );
      } catch (error) {
        console.log("Failed to save user:", error);
      }
    };

    saveUser();
  }, [user, loading]);

  // Update selected fields only
  const updateUser = (updates: Partial<User>) => {
    setUser((previousUser) => ({
      ...previousUser,
      ...updates,
    }));
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
  const context = useContext(UserContext);

  if (!context) {
    throw new Error(
      "useUser must be used within UserProvider"
    );
  }

  return context;
}
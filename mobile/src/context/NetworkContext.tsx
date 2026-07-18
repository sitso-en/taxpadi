import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import NetInfo from "@react-native-community/netinfo";

type NetworkContextType = {
  isOnline: boolean;
};

const NetworkContext = createContext<NetworkContextType>({ isOnline: true });

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const initialised = useRef(false);

  useEffect(() => {
    // Get current state immediately on mount
    NetInfo.fetch().then((state) => {
      setIsOnline(state.isConnected ?? true);
      initialised.current = true;
    });

    const unsubscribe = NetInfo.addEventListener((state) => {
      if (initialised.current) {
        setIsOnline(state.isConnected ?? true);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <NetworkContext.Provider value={{ isOnline }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  return useContext(NetworkContext);
}

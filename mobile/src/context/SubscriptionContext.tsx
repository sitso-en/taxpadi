import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppState, AppStateStatus } from "react-native";
import { getSubscriptionStatus } from "@/services/subscriptions.service";

export type SubscriptionStatus = {
  subscription_tier: string;
  status: string;
  expires_at?: string;
  auto_renew?: boolean;
  plan?: string;
};

type SubscriptionContextType = {
  isPro: boolean;
  isExpired: boolean;
  status: SubscriptionStatus | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

const SubscriptionContext = createContext<SubscriptionContextType>({
  isPro: false,
  isExpired: false,
  status: null,
  loading: true,
  refresh: async () => {},
});

function computeIsPro(status: SubscriptionStatus | null): { isPro: boolean; isExpired: boolean } {
  if (!status) return { isPro: false, isExpired: false };

  const tier = (status.subscription_tier ?? status.plan ?? "free").toLowerCase();
  const isFree = tier === "free";
  const isActive = status.status?.toLowerCase() === "active";

  const expired =
    !!status.expires_at && new Date(status.expires_at) < new Date();

  const isPro = !isFree && isActive && !expired;
  const isExpired = !isFree && expired;

  return { isPro, isExpired };
}

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const appState = useRef(AppState.currentState);

  const refresh = useCallback(async () => {
    try {
      const res = await getSubscriptionStatus();
      const data: SubscriptionStatus = res.data ?? res;
      setStatus(data);
    } catch {
      // Silently keep previous state on network errors — don't lock users out
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Re-fetch whenever app returns to foreground (handles mid-session changes:
  // subscription expires, user subscribes on another device, etc.)
  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextState === "active") {
        refresh();
      }
      appState.current = nextState;
    });
    return () => sub.remove();
  }, [refresh]);

  const { isPro, isExpired } = computeIsPro(status);

  return (
    <SubscriptionContext.Provider value={{ isPro, isExpired, status, loading, refresh }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  return useContext(SubscriptionContext);
}

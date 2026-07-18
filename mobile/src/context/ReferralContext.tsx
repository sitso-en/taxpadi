import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { getReferralOffers } from "@/services/referrals.service";

type ReferralOfferApiItem = {
  referral_id?: string;
  offer_id?: string;
  is_eligible?: boolean;
  status?: string;
};

type ReferralContextType = {
  availableOffers: number;
};

const ReferralContext = createContext<ReferralContextType>({
  availableOffers: 0,
});

export function ReferralProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [availableOffers, setAvailableOffers] = useState(0);

  const load = useCallback(async () => {
    try {
      const res = await getReferralOffers();
      const offers: ReferralOfferApiItem[] = res?.data?.offers ?? res?.data ?? [];
      setAvailableOffers(
        offers.filter((offer) => offer.is_eligible !== false && offer.status !== "dismissed").length
      );
    } catch {
      // silently ignore — badge just shows 0
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ReferralContext.Provider value={{ availableOffers }}>
      {children}
    </ReferralContext.Provider>
  );
}

export function useReferrals() {
  return useContext(ReferralContext);
}

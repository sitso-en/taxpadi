import React, {
  createContext,
  useContext,
  useState,
} from "react";

type ReferralContextType = {
  availableOffers: number;
};

const ReferralContext =
  createContext<ReferralContextType>({
    availableOffers: 0,
  });

export function ReferralProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [availableOffers] = useState(0);

  return (
    <ReferralContext.Provider
      value={{ availableOffers }}
    >
      {children}
    </ReferralContext.Provider>
  );
}

export function useReferrals() {
  return useContext(ReferralContext);
}
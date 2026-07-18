import client from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

export const getReferralOffers = async () => {
  const response = await client.get(ENDPOINTS.REFERRALS.LIST);
  return response.data;
};

export const checkEligibility = async () => {
  const response = await client.post(ENDPOINTS.REFERRALS.CHECK_ELIGIBILITY);
  return response.data;
};

export const markViewed = async (id: string) => {
  const response = await client.put(ENDPOINTS.REFERRALS.VIEWED(id));
  return response.data;
};

export const markClicked = async (id: string) => {
  const response = await client.put(ENDPOINTS.REFERRALS.CLICKED(id));
  return response.data;
};

export const dismissOffer = async (id: string) => {
  const response = await client.put(ENDPOINTS.REFERRALS.DISMISS(id));
  return response.data;
};

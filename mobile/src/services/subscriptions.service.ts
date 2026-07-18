import client from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

export const getSubscriptionPlans = async () => {
  const response = await client.get(ENDPOINTS.SUBSCRIPTIONS.PLANS);
  return response.data;
};

export const getSubscriptionStatus = async () => {
  const response = await client.get(ENDPOINTS.SUBSCRIPTIONS.STATUS);
  return response.data;
};

export const subscribe = async (payload: {
  plan: string;
  payment_method: string;
  momo_number?: string;
  momo_provider?: string;
}) => {
  const response = await client.post(ENDPOINTS.SUBSCRIPTIONS.SUBSCRIBE, payload);
  return response.data;
};

export const cancelSubscription = async () => {
  const response = await client.post(ENDPOINTS.SUBSCRIPTIONS.CANCEL);
  return response.data;
};

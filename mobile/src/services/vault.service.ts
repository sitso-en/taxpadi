import client from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

export const getVault = async () => {
  const response = await client.get(ENDPOINTS.SAVINGS_VAULT.GET);
  return response.data;
};

export const linkMomo = async (data: {
  momo_number: string;
  momo_provider: "mtn" | "telecel" | "airteltigo";
}) => {
  const response = await client.put(ENDPOINTS.SAVINGS_VAULT.LINK, data);
  return response.data;
};

export const contributeToVault = async (data: {
  amount: number;
  trigger: "manual" | "suggested";
}) => {
  const response = await client.post(ENDPOINTS.SAVINGS_VAULT.CONTRIBUTE, data);
  return response.data;
};

export const getVaultTransactions = async (params?: {
  type?: string;
  status?: string;
  trigger?: string;
  page?: number;
}) => {
  const response = await client.get(ENDPOINTS.SAVINGS_VAULT.TRANSACTIONS, { params });
  return response.data;
};

export const getVaultSuggestion = async () => {
  const response = await client.get(ENDPOINTS.SAVINGS_VAULT.SUGGESTION);
  return response.data;
};

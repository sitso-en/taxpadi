import client from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

export const getWithholdingTransactions = async (params?: {
  remitted?: boolean;
  date_from?: string;
  date_to?: string;
  category?: string;
  page?: number;
}) => {
  const response = await client.get(ENDPOINTS.WITHHOLDING_TAX.TRANSACTIONS, { params });
  return response.data;
};

export const remitWithholdingTransaction = async (id: string, remitted_at?: string) => {
  const response = await client.put(ENDPOINTS.WITHHOLDING_TAX.REMIT(id), { remitted_at });
  return response.data;
};

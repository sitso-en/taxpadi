import client from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

export const getTaxLiability = async () => {
  const response = await client.get(ENDPOINTS.TAX.LIABILITY);
  return response.data;
};

export const recalculateTaxLiability = async () => {
  const response = await client.post(ENDPOINTS.TAX.RECALCULATE);
  return response.data;
};

export const getTaxLiabilityByType = async (
  taxType: string,
  year?: number,
  month?: number
) => {
  const response = await client.get(
    `/api/v1/tax/liability/${taxType}`,
    { params: { year, month } }
  );
  return response.data;
};

export const getTaxRates = async () => {
  const response = await client.get(ENDPOINTS.TAX.RATES);
  return response.data;
};
import client from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

export const getTaxProfile = async () => {
  const response = await client.get(ENDPOINTS.TAX_PROFILE.GET);
  return response.data;
};

export const updateTaxProfile = async (data: Record<string, any>) => {
  const response = await client.put(ENDPOINTS.TAX_PROFILE.UPDATE, data);
  return response.data;
};

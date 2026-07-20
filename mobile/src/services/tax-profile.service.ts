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

export const completeOnboarding = async (data: { tax_year_start: string; tin?: string }) => {
  const response = await client.post(ENDPOINTS.TAX_PROFILE.COMPLETE_ONBOARDING, data);
  return response.data;
};

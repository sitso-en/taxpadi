import client from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

export const getTaxReturns = async (params?: {
  tax_type?: string;
  status?: string;
  year?: number;
  page?: number;
  limit?: number;
}) => {
  const response = await client.get(ENDPOINTS.TAX_RETURNS.LIST, { params });
  return response.data;
};

export const getTaxReturn = async (id: string) => {
  const response = await client.get(ENDPOINTS.TAX_RETURNS.DETAILS(id));
  return response.data;
};

export const generateTaxReturn = async (taxType: string, taxYear: number, month?: number) => {
  const response = await client.post(ENDPOINTS.TAX_RETURNS.GENERATE, {
    tax_type: taxType,
    tax_year: taxYear,
    month,
  });
  return response.data;
};

export const previewTaxReturn = async (id: string) => {
  const response = await client.get(ENDPOINTS.TAX_RETURNS.PREVIEW(id));
  return response.data;
};

export const submitTaxReturn = async (id: string, graReference?: string) => {
  const response = await client.put(ENDPOINTS.TAX_RETURNS.SUBMIT(id), {
    graReference: graReference || undefined,
    submittedAt: new Date().toISOString(),
  });
  return response.data;
};

export const amendTaxReturn = async (id: string, reason: string) => {
  const response = await client.put(ENDPOINTS.TAX_RETURNS.AMEND(id), { amendmentReason: reason });
  return response.data;
};

import client from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

export const getTaxReturns = async (
  page = 1,
  limit = 20,
  tax_type?: string,
  status?: string,
  year?: number
) => {
  const response = await client.get(
    ENDPOINTS.TAX_RETURNS.LIST,
    {
      params: {
        page,
        limit,
        tax_type,
        status,
        year,
      },
    }
  );

  return response.data;
};

export const generateTaxReturn = async (
  tax_type: string,
  tax_year: number,
  month: number
) => {
  const response = await client.post(
    ENDPOINTS.TAX_RETURNS.GENERATE,
    {
      tax_type,
      tax_year,
      month,
    }
  );

  return response.data;
};

export const previewTaxReturn = async (
  id: string
) => {
  const response = await client.get(
    ENDPOINTS.TAX_RETURNS.PREVIEW(id)
  );

  return response.data;
};

export const submitTaxReturn = async (
  id: string,
  gra_reference: string
) => {
  const response = await client.put(
    ENDPOINTS.TAX_RETURNS.SUBMIT(id),
    {
      gra_reference,
      submitted_at: new Date().toISOString(),
    }
  );

  return response.data;
};
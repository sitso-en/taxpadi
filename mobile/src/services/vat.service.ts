import client from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

export const getVatStatus = async () => {
  const response = await client.get(ENDPOINTS.VAT.STATUS);
  return response.data;
};

export const getVatRecords = async (params?: {
  year?: number;
  status?: string;
  page?: number;
}) => {
  const response = await client.get(ENDPOINTS.VAT.RECORDS, { params });
  return response.data;
};

export const registerVat = async (data: {
  vat_registration_no: string;
  registration_date?: string;
}) => {
  // VAT registration lives on the tax profile — providing a registration number
  // marks the business as VAT-registered and unlocks the VAT section.
  const response = await client.put(ENDPOINTS.TAX_PROFILE.UPDATE, {
    vat_registration_no: data.vat_registration_no,
  });
  return response.data;
};
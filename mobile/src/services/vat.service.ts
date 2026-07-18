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
  registration_date: string;
}) => {
  const response = await client.post(ENDPOINTS.VAT.REGISTER, data);
  return response.data;
};

import client from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

export const getCertificates = async (params?: {
  tax_type?: string;
  year?: number;
  page?: number;
}) => {
  const response = await client.get(ENDPOINTS.CERTIFICATES.LIST, { params });
  return response.data;
};

export const getCertificate = async (id: string) => {
  const response = await client.get(ENDPOINTS.CERTIFICATES.GET(id));
  return response.data;
};

export const getCertificateDownloadUrl = async (id: string) => {
  const response = await client.get(ENDPOINTS.CERTIFICATES.DOWNLOAD(id));
  return response.data;
};

export const requestCertificate = async (payload: {
  tax_type: string;
  period_start: string;
  period_end: string;
}) => {
  const response = await client.post(ENDPOINTS.CERTIFICATES.REQUEST, payload);
  return response.data;
};

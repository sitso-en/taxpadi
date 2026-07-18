import client from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

const defaultDateRange = (year?: number) => {
  const y = year ?? new Date().getFullYear();
  return { date_from: `${y}-01-01`, date_to: `${y}-12-31` };
};

export const getReportsSummary = async (params?: { year?: number }) => {
  const response = await client.get(ENDPOINTS.REPORTS.SUMMARY, {
    params: { ...defaultDateRange(params?.year) },
  });
  return response.data;
};

export const exportReport = async (
  format: "pdf" | "excel" | "json",
  type?: string,
  year?: number
) => {
  const response = await client.get(ENDPOINTS.REPORTS.EXPORT, {
    params: { format, type, ...defaultDateRange(year) },
  });
  return response.data;
};

export const getExportStatus = async (jobId: string) => {
  const response = await client.get(ENDPOINTS.REPORTS.EXPORT_STATUS(jobId));
  return response.data;
};

export const getIncomeStatement = async (params?: { year?: number }) => {
  const response = await client.get(ENDPOINTS.REPORTS.INCOME_STATEMENT, {
    params: { ...defaultDateRange(params?.year) },
  });
  return response.data;
};

export const getTaxHistory = async () => {
  const response = await client.get(ENDPOINTS.REPORTS.TAX_HISTORY);
  return response.data;
};

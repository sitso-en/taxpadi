import client from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

export const getDeadlines = async (params?: {
  tax_type?: string;
  completed?: boolean;
  year?: number;
  page?: number;
}) => {
  const response = await client.get(ENDPOINTS.DEADLINES.LIST, { params });
  return response.data;
};

export const getUpcomingDeadlines = async (days?: number) => {
  const response = await client.get(ENDPOINTS.DEADLINES.UPCOMING, {
    params: days ? { days } : undefined,
  });
  return response.data;
};

export const completeDeadline = async (id: string) => {
  const response = await client.put(ENDPOINTS.DEADLINES.COMPLETE(id));
  return response.data;
};

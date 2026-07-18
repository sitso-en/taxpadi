import client from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

export const getMe = async () => {
  const response = await client.get(ENDPOINTS.USER.ME);
  return response.data;
};

export const updateMe = async (data: Record<string, any>) => {
  const response = await client.put(ENDPOINTS.USER.UPDATE, data);
  return response.data;
};

export const changePassword = async (data: {
  current_password: string;
  new_password: string;
  confirm_password: string;
}) => {
  const response = await client.put(ENDPOINTS.USER.CHANGE_PASSWORD, data);
  return response.data;
};

export const getHealthScore = async () => {
  const response = await client.get(ENDPOINTS.USER.HEALTH_SCORE);
  return response.data;
};

export const requestDataExport = async () => {
  const response = await client.post(ENDPOINTS.USER.DATA_REQUEST);
  return response.data;
};

export const deactivateAccount = async (data: { password: string; reason?: string }) => {
  const response = await client.delete(ENDPOINTS.USER.DELETE, { data });
  return response.data;
};

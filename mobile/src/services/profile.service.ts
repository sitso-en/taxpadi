import client from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

export const getProfiles = async () => {
  const response = await client.get(
    ENDPOINTS.PROFILE.LIST
  );

  return response.data;
};
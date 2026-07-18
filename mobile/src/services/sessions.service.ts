import client from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

export const getSessions = async () => {
  const response = await client.get(ENDPOINTS.SESSIONS.LIST);
  return response.data;
};

export const revokeSession = async (tokenId: string) => {
  const response = await client.delete(ENDPOINTS.SESSIONS.REVOKE(tokenId));
  return response.data;
};

export const revokeAllSessions = async () => {
  const response = await client.delete(ENDPOINTS.SESSIONS.REVOKE_ALL);
  return response.data;
};

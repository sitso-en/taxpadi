import client from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import { Penalty, PenaltyResponse, ResolvePenaltyResponse } from "@/types/penalty";

export const getPenalties = async (): Promise<Penalty[]> => {
  const response = await client.get(ENDPOINTS.PENALTY.LIST);
  const data = response.data?.data;
  // backend may return { penalties: [...] } or an array directly
  return data?.penalties ?? (Array.isArray(data) ? data : []);
};

export const getPenaltyByType = async (taxType: string): Promise<PenaltyResponse> => {
  const response = await client.get<PenaltyResponse>(ENDPOINTS.PENALTY.BY_TAX_TYPE(taxType));
  return response.data;
};

export const resolvePenalty = async (penaltyId: string): Promise<ResolvePenaltyResponse> => {
  const response = await client.post<ResolvePenaltyResponse>(ENDPOINTS.PENALTY.RESOLVE, {
    penalty_id: penaltyId,
  });
  return response.data;
};
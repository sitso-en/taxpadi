import client from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import {
  PenaltyResponse,
  ResolvePenaltyResponse,
} from "@/types/penalty";

export const getPenalty = async (
  taxType: string
): Promise<PenaltyResponse> => {
  const response = await client.get<PenaltyResponse>(
    `${ENDPOINTS.PENALTY.GET}/${taxType}`
  );

  return response.data;
};

export const resolvePenalty = async (
  penaltyId: string
): Promise<ResolvePenaltyResponse> => {
  const response =
    await client.post<ResolvePenaltyResponse>(
      ENDPOINTS.PENALTY.RESOLVE,
      {
        penalty_id: penaltyId,
      }
    );

  return response.data;
};
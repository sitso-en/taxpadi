import client from "@/api/client";
import { TaxBotResponse, ConversationHistoryResponse } from "@/types/taxbot";

const BASE = "/api/v1/taxbot";

export const askTaxBot = async (
  question: string
): Promise<TaxBotResponse> => {
  const response = await client.post<TaxBotResponse>(
    `${BASE}/chat`,
    {
      question,
    }
  );

  return response.data;
};

export const getConversationHistory = async (
  page = 1,
  limit = 20
): Promise<ConversationHistoryResponse> => {
  const response =
    await client.get<ConversationHistoryResponse>(
      `${BASE}/conversations`,
      {
        params: {
          page,
          limit,
        },
      }
    );

  return response.data;
};
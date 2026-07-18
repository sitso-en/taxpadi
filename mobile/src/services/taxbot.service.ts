import client from "@/api/client";
import { TaxBotResponse, ConversationHistoryResponse } from "@/types/taxbot";

export const askTaxBot = async (
  question: string
): Promise<TaxBotResponse> => {
  const response = await client.post<TaxBotResponse>(
    "/api/v1/taxbot/ask",
    { question }
  );

  return response.data;
};

export const getConversationHistory = async (
  page = 1,
  limit = 20
): Promise<ConversationHistoryResponse> => {
  const response = await client.get<ConversationHistoryResponse>(
    "/api/v1/taxbot/history",
    { params: { page, limit } }
  );

  return response.data;
};
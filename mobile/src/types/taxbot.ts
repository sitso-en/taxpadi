export interface TaxBotMessage {
  conversation_id: string;
  question: string;
  answer: string;
  created_at: string;
}

export interface TaxBotResponse {
  success: boolean;
  data: TaxBotMessage;
  message: string;
  timestamp: string;
}

export interface ConversationHistoryResponse {
  success: boolean;
  data: {
    conversations: TaxBotMessage[];
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  message: string;
  timestamp: string;
}
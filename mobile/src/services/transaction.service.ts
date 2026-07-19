import client from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import { Platform } from "react-native";

export const getTransactions = async (params?: {
  type?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await client.get(ENDPOINTS.TRANSACTIONS.LIST, { params });
  return response.data;
};

export const getTransaction = async (id: string) => {
  const response = await client.get(
    ENDPOINTS.TRANSACTIONS.GET(id)
  );

  return response.data;
};

export const createTransaction = async (data: {
  type: string;
  amount: number;
  category: string;
  transaction_date: string;
  tax_deductible: boolean;
  withholding_applicable: boolean;
  description: string;
}) => {
  const response = await client.post(
    ENDPOINTS.TRANSACTIONS.CREATE,
    data
  );

  return response.data;
};

export const updateTransaction = async (
  id: string,
  data: {
    amount: number;
    category: string;
    description: string;
    tax_deductible: boolean;
    withholding_applicable: boolean;
    transaction_date: string;
  }
) => {
  const response = await client.put(
    ENDPOINTS.TRANSACTIONS.UPDATE(id),
    data
  );

  return response.data;
};

export const deleteTransaction = async (id: string) => {
  const response = await client.delete(
    ENDPOINTS.TRANSACTIONS.DELETE(id)
  );

  return response.data;
};

export const uploadVoiceTransaction = async (
  audioUri: string
) => {
  const formData = new FormData();

  const isAndroid = Platform.OS === "android";
  formData.append("audio", {
    uri: audioUri,
    name: isAndroid ? "voice.mp4" : "voice.m4a",
    type: isAndroid ? "audio/mp4" : "audio/m4a",
  } as any);

  const response = await client.post(
    `${ENDPOINTS.TRANSACTIONS.VOICE}?language=en`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const scanReceiptTransaction = async (
  image: string,
  transactionType: string = "expense"
) => {
  const response = await client.post(
    `${ENDPOINTS.TRANSACTIONS.SCAN}?transaction_type=${transactionType}`,
    {
      image,
    }
  );

  return response.data;
};

export const importTransactions = async (
  provider: string,
  statementFrom: string,
  statementTo: string,
  fileUri: string,
  fileName: string,
  mimeType: string
) => {
  const formData = new FormData();
  formData.append("file", { uri: fileUri, name: fileName, type: mimeType } as any);

  const response = await client.post(
    `${ENDPOINTS.TRANSACTIONS.IMPORT}?provider=${provider}&statement_from=${statementFrom}&statement_to=${statementTo}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return response.data;
};

export const validateTransactionImport = async (
  provider: string,
  fileUri: string,
  fileName: string,
  mimeType: string
) => {
  const formData = new FormData();
  formData.append("file", { uri: fileUri, name: fileName, type: mimeType } as any);

  const response = await client.post(
    `${ENDPOINTS.TRANSACTIONS.IMPORT_VALIDATE}?provider=${provider}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return response.data;
};

export const getTransactionImportHistory = async () => {
  const response = await client.get(
    ENDPOINTS.TRANSACTIONS.IMPORT_HISTORY
  );

  return response.data;
};
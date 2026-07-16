import client from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

export const getPayments = async (params?: {
  status?: string;
  payment_method?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
}) => {
  try {
    console.log(
      "GET URL:",
      client.defaults.baseURL + ENDPOINTS.PAYMENTS.LIST
    );

    const response = await client.get(
      ENDPOINTS.PAYMENTS.LIST,
      {
        params,
      }
    );

    return response.data;
  } catch (error: any) {
    console.log("PAYMENT ERROR:", error.message);
    console.log("STATUS:", error.response?.status);
    console.log("DATA:", error.response?.data);
    console.log("REQUEST URL:", error.config?.url);
    console.log("METHOD:", error.config?.method);
    throw error;
  }
};

export const getPayment = async (
  id: string
) => {
  const response = await client.get(
    ENDPOINTS.PAYMENTS.GET(id)
  );

  return response.data;
};

export const initiatePayment = async (payload: {
  amount: number;
  return_id?: string;
  penalty_id?: string;
  payment_method: string;
  momo_number?: string;
  momo_provider?: string;
}) => {
  const response = await client.post(
    ENDPOINTS.PAYMENTS.INITIATE,
    payload
  );

  return response.data;
};

export const confirmPayment = async (
  id: string,
  payload: {
    status: string;
    payment_reference: string;
  }
) => {
  const response = await client.post(
    ENDPOINTS.PAYMENTS.CONFIRM(id),
    payload
  );

  return response.data;
};

export const getPaymentStatus = async (
  id: string
) => {
  const response = await client.get(
    ENDPOINTS.PAYMENTS.STATUS(id)
  );

  return response.data;
};

export const getPaymentCertificate = async (
  id: string
) => {
  const response = await client.get(
    ENDPOINTS.PAYMENTS.CERTIFICATE(id)
  );

  return response.data;
};
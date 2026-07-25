import client from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

export const getInvoices = async (params?: {
  status?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
}) => {
  const response = await client.get(ENDPOINTS.INVOICES.LIST, { params });
  return response.data;
};

export const getInvoiceStats = async () => {
  const response = await client.get(ENDPOINTS.INVOICES.STATS);
  return response.data;
};

export const createInvoice = async (data: {
  client_name: string;
  client_email?: string;
  client_phone?: string;
  description?: string;
  subtotal: number;
  due_date?: string;
}) => {
  const response = await client.post(ENDPOINTS.INVOICES.CREATE, data);
  return response.data;
};

export const markInvoicePaid = async (id: string) => {
  const response = await client.put(ENDPOINTS.INVOICES.MARK_PAID(id));
  return response.data;
};

export const cancelInvoice = async (id: string) => {
  const response = await client.put(ENDPOINTS.INVOICES.CANCEL(id));
  return response.data;
};

export const sendInvoice = async (id: string, channel: "email" | "whatsapp" | "download") => {
  const response = await client.post(ENDPOINTS.INVOICES.SEND(id), { channel });
  return response.data;
};

export const updateInvoice = async (
  id: string,
  data: {
    client_name?: string;
    client_email?: string;
    client_phone?: string;
    description?: string;
    subtotal?: number;
    due_date?: string;
  }
) => {
  const response = await client.put(ENDPOINTS.INVOICES.UPDATE(id), data);
  return response.data;
};

export const getInvoice = async (id: string) => {
  const response = await client.get(ENDPOINTS.INVOICES.GET(id));
  return response.data;
};

export const getInvoicePdf = async (id: string) => {
  const response = await client.get(ENDPOINTS.INVOICES.PDF(id));
  return response.data;
};
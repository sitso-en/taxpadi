import client from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

export const getPayeRecords = async (params?: {
  month?: number;
  year?: number;
  employee_id?: string;
  remitted?: boolean;
  page?: number;
}) => {
  const response = await client.get(ENDPOINTS.PAYE.RECORDS, { params });
  return response.data;
};

export const getPayeRecordsByPeriod = async (month: string, year: string) => {
  const response = await client.get(ENDPOINTS.PAYE.RECORD_BY_PERIOD(month, year));
  return response.data;
};

export const getPayeEmployees = async (params?: {
  status?: string;
  page?: number;
}) => {
  const response = await client.get(ENDPOINTS.PAYE.EMPLOYEES, { params });
  return response.data;
};

export const addPayeEmployee = async (data: {
  full_name: string;
  position?: string;
  gross_salary: number;
  transport_allowance?: number;
  housing_allowance?: number;
  other_allowances?: number;
  social_security_no?: string;
  start_date: string;
}) => {
  const response = await client.post(ENDPOINTS.PAYE.EMPLOYEES, data);
  return response.data;
};

export const remitPayeRecord = async (id: string, remitted_at?: string) => {
  const response = await client.put(ENDPOINTS.PAYE.REMIT(id), { remitted_at });
  return response.data;
};

export const getPayeAnnualReturn = async (year: string) => {
  const response = await client.get(ENDPOINTS.PAYE.ANNUAL_RETURN(year));
  return response.data;
};

export const updatePayeEmployee = async (id: string, data: {
  full_name?: string;
  position?: string;
  gross_salary?: number;
  transport_allowance?: number;
  housing_allowance?: number;
  other_allowances?: number;
  social_security_no?: string;
}) => {
  const response = await client.put(ENDPOINTS.PAYE.EMPLOYEE(id), data);
  return response.data;
};

export const deactivatePayeEmployee = async (id: string, end_date: string) => {
  const response = await client.delete(ENDPOINTS.PAYE.EMPLOYEE(id), { data: { end_date } });
  return response.data;
};

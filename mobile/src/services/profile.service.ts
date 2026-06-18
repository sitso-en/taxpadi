import client from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

export const getProfiles = async () => {
  const response = await client.get(ENDPOINTS.PROFILE.LIST);
  return response.data;
};

export const createProfile = async (data: {
  label: string;
  taxpayerCategory: string;
  tin?: string;
}) => {
  const response = await client.post(ENDPOINTS.PROFILE.CREATE, {
    label: data.label,
    taxpayer_category: data.taxpayerCategory,
    tin: data.tin,
  });
  return response.data;
};

export const switchProfile = async (id: string) => {
  const response = await client.put(ENDPOINTS.PROFILE.SWITCH(id));
  return response.data;
};

export const updateProfile = async (id: string, data: {
  label?: string;
  taxpayerCategory?: string;
  tin?: string;
}) => {
  const response = await client.put(ENDPOINTS.PROFILE.UPDATE(id), {
    label: data.label,
    taxpayer_category: data.taxpayerCategory,
    tin: data.tin,
  });
  return response.data;
};

export const deleteProfile = async (id: string) => {
  const response = await client.delete(ENDPOINTS.PROFILE.DELETE(id));
  return response.data;
};
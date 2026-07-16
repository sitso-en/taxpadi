import client from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";

export const getTaxLiability = async () => {
  try {
    const response = await client.get(
      ENDPOINTS.TAX.LIABILITY
    );

    return response.data;
  } catch (error: any) {
    console.log("TAX LIABILITY ERROR:", error.message);
    console.log("STATUS:", error.response?.status);
    console.log("DATA:", error.response?.data);
    throw error;
  }
};
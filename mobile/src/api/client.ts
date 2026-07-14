import axios from "axios";
import { getAccessToken } from "@/utils/storage";

const client = axios.create({
  baseURL: "https://taxpadi-pomd.onrender.com",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

client.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();

    console.log("ACCESS TOKEN:", token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log("FINAL HEADERS:", config.headers);
    
    return config;
  },
  (error) => Promise.reject(error)
);

export default client;
import axios from "axios";
import {
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearTokens,
} from "@/utils/storage";

const client = axios.create({
  baseURL: "https://taxpadi-pomd.onrender.com",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach access token
client.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Automatically refresh expired access tokens
client.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest: any = error.config;

    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = await getRefreshToken();

        if (!refreshToken) {
          throw new Error("No refresh token.");
        }

        const response = await axios.post(
          "https://taxpadi-pomd.onrender.com/api/v1/auth/refresh",
          {
            refresh_token: refreshToken,
          }
        );

        const newAccessToken =
          response.data.data.access_token;

        await saveTokens(
          newAccessToken,
          refreshToken
        );

        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        return client(originalRequest);
      } catch (refreshError) {
        await clearTokens();

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default client;
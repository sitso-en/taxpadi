import client from "@/api/client";
import { ENDPOINTS } from "@/api/endpoints";
import { saveTokens, clearTokens } from "@/utils/storage";
import { LoginResponse } from "@/types/auth";

export const login = async (
  phone: string,
  password: string,
  deviceInfo: string
): Promise<LoginResponse> => {
  console.log("Sending login request...");

  console.log(
    "URL:",
    client.defaults.baseURL + ENDPOINTS.AUTH.LOGIN
  );
  const response = await client.post<LoginResponse>(
    ENDPOINTS.AUTH.LOGIN,
    {
      phone,
      password,
      device_info: deviceInfo,
    },
    {
      timeout: 5000,
    }
  );

  console.log("Login request finished.");

  if (
    response.data.success &&
    !response.data.data.requires_otp &&
    response.data.data.access_token
  ) {
    await saveTokens(
      response.data.data.access_token,
      response.data.data.refresh_token
    );
  }

  return response.data;
};

export const register = async (payload: {
  full_name: string;
  phone: string;
  email?: string;
  password: string;
  region: string;
  taxpayer_category: string;
}) => {
  const response = await client.post(
    ENDPOINTS.AUTH.REGISTER,
    payload
  );

  return response.data;
};

export const verifyOTP = async (
  phone: string,
  otp: string
) => {
  const response = await client.post(
    ENDPOINTS.AUTH.VERIFY_OTP,
    {
      phone,
      otp,
    }
  );

  if (
    response.data.success &&
    response.data.data?.access_token
  ) {
    await saveTokens(
      response.data.data.access_token,
      response.data.data.refresh_token
    );
  }

  return response.data;
};

export const resendOTP = async (
  phone: string
) => {
  const response = await client.post(
    ENDPOINTS.AUTH.RESEND_OTP,
    {
      phone,
    }
  );

  return response.data;
};

export const forgotPassword = async (
  phone: string
) => {
  const response = await client.post(
    ENDPOINTS.AUTH.FORGOT_PASSWORD,
    {
      phone,
    }
  );

  return response.data;
};

export const verifyResetOTP = async (
  phone: string,
  otp: string
) => {
  const response = await client.post(
    ENDPOINTS.AUTH.VERIFY_RESET_OTP,
    {
      phone,
      otp,
    }
  );

  return response.data;
};

export const resetPassword = async (
  resetToken: string,
  newPassword: string,
  confirmPassword: string
) => {
  const response = await client.post(
    ENDPOINTS.AUTH.RESET_PASSWORD,
    {
      reset_token: resetToken,
      new_password: newPassword,
      confirm_password: confirmPassword,
    }
  );

  return response.data;
};

export const logout = async (
  refreshToken: string
) => {
  try {
    await client.post(
      ENDPOINTS.AUTH.LOGOUT,
      {
        refresh_token: refreshToken,
      }
    );
  } finally {
    await clearTokens();
  }
};

export const refreshAccessToken = async (
  refreshToken: string
) => {
  const response = await client.post(
    ENDPOINTS.AUTH.REFRESH,
    {
      refresh_token: refreshToken,
    }
  );

  return response.data;
};
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

const isWeb = Platform.OS === "web";

export const saveTokens = async (
  accessToken: string,
  refreshToken: string
) => {
  if (isWeb) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    return;
  }

  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
};

export const getAccessToken = async () => {
  if (isWeb) {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = async () => {
  if (isWeb) {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
};

export const clearTokens = async () => {
  if (isWeb) {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    return;
  }

  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
};

const BIOMETRIC_TOKEN_KEY = "biometric_token";
const BIOMETRIC_ENABLED_KEY = "biometric_enabled";

export const getBiometricToken = async (): Promise<string | null> => {
  if (isWeb) return null;
  return SecureStore.getItemAsync(BIOMETRIC_TOKEN_KEY);
};

export const saveBiometricToken = async (token: string): Promise<void> => {
  if (isWeb) return;
  await SecureStore.setItemAsync(BIOMETRIC_TOKEN_KEY, token);
};

export const setBiometricEnabled = async (enabled: boolean): Promise<void> => {
  if (isWeb) return;
  if (enabled) {
    await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, "true");
  } else {
    await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
  }
};

export const isBiometricEnabled = async (): Promise<boolean> => {
  if (isWeb) return false;
  const val = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
  return val === "true";
};
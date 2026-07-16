import * as Device from "expo-device";
import { Platform } from "react-native";

export const getDeviceInfo = (): string => {
  const brand = Device.brand ?? "Unknown";
  const model = Device.modelName ?? "Unknown";
  const os = Platform.OS;
  const version = Device.osVersion ?? "";

  return `${brand} ${model} (${os} ${version})`;
};
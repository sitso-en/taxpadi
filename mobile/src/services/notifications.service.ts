import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export async function getDeviceToken() {
  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } =
      await Notifications.requestPermissionsAsync();

    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  const token =
    await Notifications.getDevicePushTokenAsync();

  return {
    token: token.data,
    platform: Platform.OS,
  };
}
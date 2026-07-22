import { Platform } from "react-native";

export async function getDeviceToken() {
  // Lazy require — expo-notifications remote push APIs were removed from
  // Expo Go in SDK 53. The module throws at evaluation in Expo Go, so we
  // must never import it statically.
  let Notifications: typeof import("expo-notifications");
  try {
    Notifications = require("expo-notifications");
  } catch {
    return null;
  }

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
import axios from "axios";

export function formatCategory(value?: string): string {
  if (!value) return "—";
  return value
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export function getUserFriendlyError(error: any): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;

    switch (status) {
      case 400: {
        const message =
          error.response?.data?.message?.toLowerCase() ?? "";

        if (
          message.includes("otp") ||
          message.includes("one-time password") ||
          message.includes("verification")
        ) {
          return "The verification code is invalid or has expired. Please request a new one and try again.";
        }

        if (message.includes("email")) {
          return "Please enter a valid email address.";
        }

        if (message.includes("phone")) {
          return "Please enter a valid phone number, including the country code.";
        }

        if (message.includes("password")) {
          return "Your password doesn't meet the requirements. It must be at least 8 characters with a mix of letters and numbers.";
        }

        if (message.includes("tin")) {
          return "The TIN you entered doesn't look right. Please double-check and try again.";
        }

        return "Some of the information you entered isn't valid. Please check and try again.";
      }

      case 401:
        return "Your session has expired. Please sign in again to continue.";

      case 403:
        return "You don't have permission to do that. If this seems wrong, please contact support.";

      case 404:
        return "We couldn't find what you were looking for. It may have been removed or the link is incorrect.";

      case 405:
        return "This action isn't supported. Please update the app to the latest version and try again.";

      case 408:
        return "The request took too long. Check your internet connection and try again.";

      case 409:
        return (
          error.response?.data?.message ??
          "This conflicts with existing data. Please refresh and try again."
        );

      case 422:
        return (
          error.response?.data?.message ??
          "Some of the details you submitted couldn't be processed. Please review and try again."
        );

      case 429:
        return "You've made too many requests. Please wait a moment before trying again.";

      case 500:
      case 502:
      case 503:
      case 504:
        return "Our servers ran into a problem. Please try again in a moment.";

      default:
        return "Something went wrong. Please check your connection and try again.";
    }
  }

  if (error?.code === "ECONNABORTED") {
    return "The request took too long. Check your internet connection and try again.";
  }

  if (
    error?.message?.includes("Network") ||
    error?.message?.includes("network")
  ) {
    return "Couldn't connect to the server. Please check your internet connection and try again.";
  }

  return "Something went wrong. Please try again.";
}
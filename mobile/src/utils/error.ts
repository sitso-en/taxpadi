import axios from "axios";

export function getUserFriendlyError(error: any): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;

    switch (status) {
     case 400: {
  const message =
    error.response?.data?.message?.toLowerCase() ?? "";
    console.log("400 BACKEND MESSAGE:", message);

  if (
  message.includes("otp") ||
  message.includes("one-time password") ||
  message.includes("verification")
) {
  return "The verification code is invalid or incomplete. Please enter the code and try again.";
}  

  if (message.includes("email")) {
    return "Please enter a valid email address.";
  }

  if (message.includes("phone")) {
    return "Please enter a valid phone number.";
  }

  if (message.includes("password")) {
    return "Your password does not meet the required requirements.";
  }

  return "Please check the information you entered and try again.";
}

      case 401:
      case 403:
        return "Your session has expired. Please sign in again.";

      case 404:
        return "The requested information could not be found.";

      case 408:
        return "The request timed out. Please try again.";

      case 409:
        return (
          error.response?.data?.message ??
          "This action could not be completed."
        );

      case 422:
        return (
          error.response?.data?.message ??
          "Please review the information you entered."
        );

      case 429:
        return "Too many requests. Please wait a moment and try again.";

      case 500:
      case 502:
      case 503:
      case 504:
        return " Please try again later.";

      default:
        return (
          error.response?.data?.message ??
          "Something went wrong. Please try again."
        );
    }
  }

  if (error?.code === "ECONNABORTED") {
    return "The request took too long. Please try again.";
  }

  if (
    error?.message?.includes("Network") ||
    error?.message?.includes("network")
  ) {
    return "Please check your internet connection and try again.";
  }

  return "Something went wrong. Please try again.";
}
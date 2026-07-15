export interface LoginUser {
  user_id: string;
  phone: string;
  full_name: string;
  email?: string;
  subscription_tier: string;
  onboarding_complete: boolean;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: LoginUser;
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
    requires_otp: boolean;
  };
  message: string;
  timestamp: string;
}

export interface RegisterResponse {
  success: boolean;
  data: {
    user_id: string;
    phone: string;
    requires_otp: boolean;
  };
  message: string;
  timestamp: string;
}

export interface OTPVerificationResponse {
  success: boolean;
  data: {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
    user: LoginUser;
  };
  message: string;
  timestamp: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  data: {
    phone: string;
    expires_in: number;
  };
  message: string;
  timestamp: string;
}

export interface VerifyResetOTPResponse {
  success: boolean;
  data: {
    reset_token: string;
  };
  message: string;
  timestamp: string;
}
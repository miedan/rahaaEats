export interface RegisterRequest {
  phoneNumber: string;
  password: string;
}

export interface RegisterResponse {
  userId: string;
  phoneNumber: string;
}

export interface VerifyOtpRequest {
  phoneNumber: string;
  otp: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUserSummary {
  id: string;
  phoneNumber: string;
  fullName: string | null;
  role: string;
}

export interface LoginRequest {
  phoneNumber: string;
  password: string;
}

export interface LoginResponse extends AuthTokens {
  user: AuthUserSummary;
}

export type VerifyOtpResponse = LoginResponse;

export interface ForgotPasswordRequest {
  phoneNumber: string;
}

export interface ResetPasswordRequest {
  phoneNumber: string;
  otp: string;
  newPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export type OtpPurpose = 'REGISTRATION' | 'PASSWORD_RESET';

export interface ResendOtpRequest {
  phoneNumber: string;
  purpose: OtpPurpose;
}

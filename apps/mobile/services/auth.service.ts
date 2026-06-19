import type {
  RegisterRequest,
  RegisterResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  LoginRequest,
  LoginResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ResendOtpRequest,
  OtpPurpose,
} from '@rahaa/shared';
import { apiRequest } from './api';

export function register(payload: RegisterRequest) {
  return apiRequest<RegisterResponse>('/auth/register', { method: 'POST', body: payload });
}

export function verifyOtp(payload: VerifyOtpRequest) {
  return apiRequest<VerifyOtpResponse>('/auth/verify-otp', { method: 'POST', body: payload });
}

export function login(payload: LoginRequest) {
  return apiRequest<LoginResponse>('/auth/login', { method: 'POST', body: payload });
}

export function forgotPassword(payload: ForgotPasswordRequest) {
  return apiRequest<{ message: string }>('/auth/forgot-password', { method: 'POST', body: payload });
}

export function resetPassword(payload: ResetPasswordRequest) {
  return apiRequest<{ message: string }>('/auth/reset-password', { method: 'POST', body: payload });
}

export function resendOtp(phoneNumber: string, purpose: OtpPurpose) {
  const payload: ResendOtpRequest = { phoneNumber, purpose };
  return apiRequest<{ message: string }>('/auth/resend-otp', { method: 'POST', body: payload });
}

export function logout(refreshToken: string) {
  return apiRequest<{ message: string }>('/auth/logout', { method: 'POST', body: { refreshToken } });
}

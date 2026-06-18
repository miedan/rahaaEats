import { Request, Response } from 'express';
import { OtpPurpose } from '@prisma/client';
import {
  createUserWithOtp,
  verifyRegistrationOtp,
  loginUser,
  initiateForgotPassword,
  resetPassword,
  resendOtp,
} from '../services/auth.service';
import { issueTokenPair, rotateRefreshToken, revokeRefreshToken } from '../services/token.service';
import { sendSuccess, sendError } from '../utils/response';
import { normalizePhone } from '../utils/phone';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { phoneNumber, password } = req.body as { phoneNumber: string; password: string };
    const result = await createUserWithOtp(phoneNumber, password);
    sendSuccess(res, result, 201);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '';
    if (msg === 'PHONE_TAKEN') {
      sendError(res, 409, 'PHONE_TAKEN', 'Phone number already registered');
    } else if (msg === 'OTP_RATE_LIMIT') {
      sendError(res, 429, 'OTP_RATE_LIMIT', 'Too many OTP requests. Try again later.');
    } else {
      sendError(res, 500, 'SERVER_ERROR', 'Registration failed');
    }
  }
}

export async function verifyOtp(req: Request, res: Response): Promise<void> {
  try {
    const { phoneNumber, otp } = req.body as { phoneNumber: string; otp: string };
    const user = await verifyRegistrationOtp(phoneNumber, otp);
    const tokens = await issueTokenPair(user.id, user.role);
    sendSuccess(res, {
      ...tokens,
      user: { id: user.id, phoneNumber: user.phoneNumber, fullName: user.fullName, role: user.role },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '';
    handleOtpError(res, msg);
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { phoneNumber, password } = req.body as { phoneNumber: string; password: string };
    const user = await loginUser(phoneNumber, password);
    const tokens = await issueTokenPair(user.id, user.role);
    sendSuccess(res, {
      ...tokens,
      user: { id: user.id, phoneNumber: user.phoneNumber, fullName: user.fullName, role: user.role },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '';
    if (msg === 'INVALID_CREDENTIALS') {
      sendError(res, 401, 'INVALID_CREDENTIALS', 'Invalid phone number or password');
    } else if (msg === 'NOT_VERIFIED') {
      sendError(res, 403, 'NOT_VERIFIED', 'Account not verified. Check your SMS for the OTP.');
    } else {
      sendError(res, 500, 'SERVER_ERROR', 'Login failed');
    }
  }
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  try {
    const { phoneNumber } = req.body as { phoneNumber: string };
    await initiateForgotPassword(phoneNumber);
    // Always respond 200 to avoid phone enumeration
    sendSuccess(res, { message: 'If that number is registered, an OTP has been sent.' });
  } catch {
    sendError(res, 500, 'SERVER_ERROR', 'Failed to process request');
  }
}

export async function resetPasswordHandler(req: Request, res: Response): Promise<void> {
  try {
    const { phoneNumber, otp, newPassword } = req.body as {
      phoneNumber: string;
      otp: string;
      newPassword: string;
    };
    await resetPassword(phoneNumber, otp, newPassword);
    sendSuccess(res, { message: 'Password updated successfully' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '';
    handleOtpError(res, msg);
  }
}

export async function refreshTokenHandler(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body as { refreshToken: string };
    const tokens = await rotateRefreshToken(refreshToken);
    sendSuccess(res, tokens);
  } catch {
    sendError(res, 401, 'INVALID_REFRESH_TOKEN', 'Refresh token is invalid or expired');
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body as { refreshToken: string };
    if (refreshToken) await revokeRefreshToken(refreshToken);
    sendSuccess(res, { message: 'Logged out successfully' });
  } catch {
    sendError(res, 500, 'SERVER_ERROR', 'Logout failed');
  }
}

export async function resendOtpHandler(req: Request, res: Response): Promise<void> {
  try {
    const { phoneNumber, purpose } = req.body as { phoneNumber: string; purpose: string };
    const otpPurpose = purpose === 'PASSWORD_RESET' ? OtpPurpose.PASSWORD_RESET : OtpPurpose.REGISTRATION;
    await resendOtp(phoneNumber, otpPurpose);
    sendSuccess(res, { message: 'OTP resent' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '';
    if (msg === 'OTP_RATE_LIMIT') {
      sendError(res, 429, 'OTP_RATE_LIMIT', 'Too many OTP requests. Try again in 1 hour.');
    } else if (msg === 'USER_NOT_FOUND') {
      sendError(res, 404, 'USER_NOT_FOUND', 'No account found with that phone number');
    } else {
      sendError(res, 500, 'SERVER_ERROR', 'Failed to resend OTP');
    }
  }
}

function handleOtpError(res: Response, msg: string): void {
  if (msg === 'USER_NOT_FOUND') {
    sendError(res, 404, 'USER_NOT_FOUND', 'No account found with that phone number');
  } else if (msg === 'ALREADY_VERIFIED') {
    sendError(res, 409, 'ALREADY_VERIFIED', 'Account is already verified');
  } else if (msg === 'OTP_NOT_FOUND') {
    sendError(res, 400, 'OTP_NOT_FOUND', 'No active OTP found. Request a new one.');
  } else if (msg === 'OTP_EXPIRED') {
    sendError(res, 400, 'OTP_EXPIRED', 'OTP has expired. Request a new one.');
  } else if (msg === 'OTP_LOCKED_OUT') {
    sendError(res, 429, 'OTP_LOCKED_OUT', 'Too many failed attempts. Try again in 10 minutes.');
  } else if (msg === 'OTP_MAX_ATTEMPTS') {
    sendError(res, 429, 'OTP_MAX_ATTEMPTS', 'Maximum OTP attempts reached. Request a new code.');
  } else if (msg.startsWith('OTP_INVALID:')) {
    const remaining = msg.split(':')[1];
    sendError(res, 400, 'OTP_INVALID', `Invalid code. ${remaining} attempt(s) remaining.`);
  } else {
    sendError(res, 500, 'SERVER_ERROR', 'An unexpected error occurred');
  }
}

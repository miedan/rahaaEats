import bcrypt from 'bcrypt';
import { OtpPurpose } from '@prisma/client';
import prisma from '../config/prisma';
import { generateOtp, otpExpiresAt } from '../utils/otp';
import { sendOtpSms } from './sms.service';
import { normalizePhone } from '../utils/phone';

const BCRYPT_ROUNDS = 12;
const OTP_MAX_ATTEMPTS = 3;
const OTP_LOCKOUT_MINUTES = 10;
const OTP_MAX_SENDS_PER_HOUR = 3;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createUserWithOtp(phoneNumber: string, password: string) {
  const normalized = normalizePhone(phoneNumber);

  const existing = await prisma.user.findUnique({ where: { phoneNumber: normalized } });
  if (existing) {
    if (existing.isVerified) throw new Error('PHONE_TAKEN');
    await checkOtpSendRateLimit(existing.id, OtpPurpose.REGISTRATION);
    await issueOtp(existing.id, OtpPurpose.REGISTRATION, normalized);
    return { userId: existing.id, phoneNumber: normalized };
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { phoneNumber: normalized, passwordHash, role: 'CUSTOMER' },
  });

  await issueOtp(user.id, OtpPurpose.REGISTRATION, normalized);
  return { userId: user.id, phoneNumber: normalized };
}

export async function verifyRegistrationOtp(phoneNumber: string, code: string) {
  const normalized = normalizePhone(phoneNumber);
  const user = await prisma.user.findUnique({ where: { phoneNumber: normalized } });
  if (!user) throw new Error('USER_NOT_FOUND');
  if (user.isVerified) throw new Error('ALREADY_VERIFIED');

  await consumeOtp(user.id, OtpPurpose.REGISTRATION, code);

  await prisma.user.update({ where: { id: user.id }, data: { isVerified: true } });
  return user;
}

export async function loginUser(phoneNumber: string, password: string) {
  const normalized = normalizePhone(phoneNumber);
  const user = await prisma.user.findUnique({ where: { phoneNumber: normalized } });
  if (!user) throw new Error('INVALID_CREDENTIALS');
  if (!user.isVerified) throw new Error('NOT_VERIFIED');

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) throw new Error('INVALID_CREDENTIALS');

  return user;
}

export async function initiateForgotPassword(phoneNumber: string) {
  const normalized = normalizePhone(phoneNumber);
  const user = await prisma.user.findUnique({ where: { phoneNumber: normalized } });
  if (!user) return; // silent — don't leak whether phone exists
  if (!user.isVerified) return;

  await checkOtpSendRateLimit(user.id, OtpPurpose.PASSWORD_RESET);
  await issueOtp(user.id, OtpPurpose.PASSWORD_RESET, normalized);
}

export async function resetPassword(phoneNumber: string, code: string, newPassword: string) {
  const normalized = normalizePhone(phoneNumber);
  const user = await prisma.user.findUnique({ where: { phoneNumber: normalized } });
  if (!user) throw new Error('USER_NOT_FOUND');

  await consumeOtp(user.id, OtpPurpose.PASSWORD_RESET, code);

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  // Revoke all refresh tokens on password reset
  await prisma.refreshToken.updateMany({
    where: { userId: user.id },
    data: { revoked: true },
  });
}

export async function resendOtp(phoneNumber: string, purpose: OtpPurpose) {
  const normalized = normalizePhone(phoneNumber);
  const user = await prisma.user.findUnique({ where: { phoneNumber: normalized } });
  if (!user) throw new Error('USER_NOT_FOUND');

  await checkOtpSendRateLimit(user.id, purpose);
  await issueOtp(user.id, purpose, normalized);
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

async function issueOtp(userId: string, purpose: OtpPurpose, phoneNumber: string) {
  // Invalidate any active OTPs for this user+purpose
  await prisma.otpCode.updateMany({
    where: { userId, purpose, used: false },
    data: { used: true },
  });

  const code = generateOtp();
  await prisma.otpCode.create({
    data: { userId, code, purpose, expiresAt: otpExpiresAt() },
  });

  await sendOtpSms(phoneNumber, code);
}

async function checkOtpSendRateLimit(userId: string, purpose: OtpPurpose) {
  const since = new Date(Date.now() - 60 * 60 * 1000);
  const count = await prisma.otpCode.count({
    where: { userId, purpose, createdAt: { gte: since } },
  });
  if (count >= OTP_MAX_SENDS_PER_HOUR) throw new Error('OTP_RATE_LIMIT');
}

async function consumeOtp(userId: string, purpose: OtpPurpose, code: string) {
  const otp = await prisma.otpCode.findFirst({
    where: { userId, purpose, used: false },
    orderBy: { createdAt: 'desc' },
  });

  if (!otp) throw new Error('OTP_NOT_FOUND');

  if (otp.expiresAt < new Date()) {
    throw new Error('OTP_EXPIRED');
  }

  if (otp.attempts >= OTP_MAX_ATTEMPTS) {
    const lockoutEnd = new Date(otp.createdAt.getTime() + OTP_LOCKOUT_MINUTES * 60 * 1000);
    if (new Date() < lockoutEnd) throw new Error('OTP_LOCKED_OUT');
  }

  if (otp.code !== code) {
    await prisma.otpCode.update({
      where: { id: otp.id },
      data: { attempts: { increment: 1 } },
    });
    const remaining = OTP_MAX_ATTEMPTS - (otp.attempts + 1);
    if (remaining <= 0) throw new Error('OTP_MAX_ATTEMPTS');
    throw new Error(`OTP_INVALID:${remaining}`);
  }

  await prisma.otpCode.update({ where: { id: otp.id }, data: { used: true } });
}

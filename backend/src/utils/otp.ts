import crypto from 'crypto';

export function generateOtp(): string {
  return String(crypto.randomInt(100000, 999999));
}

export function otpExpiresAt(): Date {
  return new Date(Date.now() + 5 * 60 * 1000);
}

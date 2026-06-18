import prisma from '../config/prisma';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  refreshTokenExpiresAt,
  AccessTokenPayload,
} from '../utils/jwt';
import { UserRole } from '@prisma/client';

export async function issueTokenPair(userId: string, role: UserRole) {
  const accessToken = signAccessToken({ userId, role });
  const refreshToken = signRefreshToken(userId);
  const tokenHash = hashToken(refreshToken);

  await prisma.refreshToken.create({
    data: { userId, tokenHash, expiresAt: refreshTokenExpiresAt() },
  });

  return { accessToken, refreshToken };
}

export async function rotateRefreshToken(rawToken: string) {
  let payload: { userId: string };
  try {
    payload = verifyRefreshToken(rawToken);
  } catch {
    throw new Error('INVALID_REFRESH_TOKEN');
  }

  const tokenHash = hashToken(rawToken);
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    // Possible token reuse — revoke all tokens for safety
    if (stored) {
      await prisma.refreshToken.updateMany({
        where: { userId: stored.userId },
        data: { revoked: true },
      });
    }
    throw new Error('INVALID_REFRESH_TOKEN');
  }

  await prisma.refreshToken.update({ where: { tokenHash }, data: { revoked: true } });

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) throw new Error('USER_NOT_FOUND');

  return issueTokenPair(user.id, user.role);
}

export async function revokeRefreshToken(rawToken: string) {
  const tokenHash = hashToken(rawToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash },
    data: { revoked: true },
  });
}

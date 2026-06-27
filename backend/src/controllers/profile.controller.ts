import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';

export async function getProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        phoneNumber: true,
        fullName: true,
        email: true,
        profilePhotoUrl: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      sendError(res, 404, 'USER_NOT_FOUND', 'User not found');
      return;
    }

    sendSuccess(res, user);
  } catch {
    sendError(res, 500, 'SERVER_ERROR', 'Failed to fetch profile');
  }
}

export async function updateProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { fullName, email, profilePhotoUrl } = req.body as {
      fullName?: string;
      email?: string;
      profilePhotoUrl?: string;
    };

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: {
        ...(fullName !== undefined && { fullName }),
        ...(email !== undefined && { email }),
        ...(profilePhotoUrl !== undefined && { profilePhotoUrl }),
      },
      select: {
        id: true,
        phoneNumber: true,
        fullName: true,
        email: true,
        profilePhotoUrl: true,
        role: true,
        createdAt: true,
      },
    });

    sendSuccess(res, user);
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === 'P2002') {
      sendError(res, 409, 'EMAIL_TAKEN', 'That email address is already in use');
      return;
    }
    sendError(res, 500, 'SERVER_ERROR', 'Failed to update profile');
  }
}

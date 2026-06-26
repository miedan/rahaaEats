import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';

export async function listMomoNumbers(req: AuthRequest, res: Response): Promise<void> {
  try {
    const numbers = await prisma.savedMomoNumber.findMany({
      where: { userId: req.userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });
    sendSuccess(res, numbers);
  } catch {
    sendError(res, 500, 'SERVER_ERROR', 'Failed to fetch MoMo numbers');
  }
}

export async function createMomoNumber(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { phoneNumber, provider, isDefault } = req.body as {
      phoneNumber: string;
      provider: 'MTN' | 'AIRTEL';
      isDefault?: boolean;
    };

    if (isDefault) {
      await prisma.savedMomoNumber.updateMany({
        where: { userId: req.userId },
        data: { isDefault: false },
      });
    }

    const hasExisting = await prisma.savedMomoNumber.count({ where: { userId: req.userId } });

    const created = await prisma.savedMomoNumber.upsert({
      where: { userId_phoneNumber: { userId: req.userId!, phoneNumber } },
      update: { provider, isDefault: isDefault ?? hasExisting === 0 },
      create: {
        userId: req.userId!,
        phoneNumber,
        provider,
        isDefault: isDefault ?? hasExisting === 0,
      },
    });

    sendSuccess(res, created, 201);
  } catch {
    sendError(res, 500, 'SERVER_ERROR', 'Failed to save MoMo number');
  }
}

export async function deleteMomoNumber(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const existing = await prisma.savedMomoNumber.findFirst({ where: { id, userId: req.userId } });
    if (!existing) {
      sendError(res, 404, 'NOT_FOUND', 'MoMo number not found');
      return;
    }
    await prisma.savedMomoNumber.delete({ where: { id } });
    sendSuccess(res, { message: 'MoMo number deleted' });
  } catch {
    sendError(res, 500, 'SERVER_ERROR', 'Failed to delete MoMo number');
  }
}

export async function setDefaultMomoNumber(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const existing = await prisma.savedMomoNumber.findFirst({ where: { id, userId: req.userId } });
    if (!existing) {
      sendError(res, 404, 'NOT_FOUND', 'MoMo number not found');
      return;
    }

    await prisma.savedMomoNumber.updateMany({
      where: { userId: req.userId },
      data: { isDefault: false },
    });
    const updated = await prisma.savedMomoNumber.update({
      where: { id },
      data: { isDefault: true },
    });

    sendSuccess(res, updated);
  } catch {
    sendError(res, 500, 'SERVER_ERROR', 'Failed to set default MoMo number');
  }
}

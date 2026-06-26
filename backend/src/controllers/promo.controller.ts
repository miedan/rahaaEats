import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';

export async function listPromoCodes(_req: Request, res: Response): Promise<void> {
  try {
    const promoCodes = await prisma.promoCode.findMany({
      where: {
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: { createdAt: 'desc' },
    });

    const available = promoCodes.filter((p) => p.maxUses === null || p.usedCount < p.maxUses);

    sendSuccess(res, available);
  } catch {
    sendError(res, 500, 'SERVER_ERROR', 'Failed to fetch promo codes');
  }
}

export async function validatePromo(req: Request, res: Response): Promise<void> {
  try {
    const { code, subtotalRwf } = req.body as { code?: string; subtotalRwf?: number };

    if (!code || subtotalRwf === undefined) {
      sendError(res, 400, 'VALIDATION_ERROR', 'code and subtotalRwf are required');
      return;
    }

    const promo = await prisma.promoCode.findUnique({ where: { code: code.toUpperCase() } });

    if (!promo) {
      sendSuccess(res, { valid: false, discountRwf: 0, description: 'Invalid coupon code' });
      return;
    }

    if (promo.expiresAt && promo.expiresAt < new Date()) {
      sendSuccess(res, { valid: false, discountRwf: 0, description: 'This coupon has expired' });
      return;
    }

    if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
      sendSuccess(res, { valid: false, discountRwf: 0, description: 'This coupon has been fully redeemed' });
      return;
    }

    if (subtotalRwf < promo.minOrderRwf) {
      sendSuccess(res, {
        valid: false,
        discountRwf: 0,
        description: `Minimum order of ${promo.minOrderRwf.toLocaleString('en-RW')} RWF required`,
      });
      return;
    }

    const discountRwf =
      promo.discountType === 'PERCENT'
        ? Math.round((subtotalRwf * promo.discountValue) / 100)
        : promo.discountValue;

    sendSuccess(res, {
      valid: true,
      discountRwf: Math.min(discountRwf, subtotalRwf),
      description: `${promo.code} applied`,
    });
  } catch {
    sendError(res, 500, 'SERVER_ERROR', 'Failed to validate coupon');
  }
}

import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';

export async function listCategories(_req: Request, res: Response): Promise<void> {
  try {
    const groups = await prisma.menuItem.groupBy({
      by: ['category'],
      where: { isAvailable: true, restaurant: { isApproved: true } },
      _count: { _all: true },
    });

    const categories = groups
      .map((g) => ({ category: g.category, itemCount: g._count._all }))
      .sort((a, b) => b.itemCount - a.itemCount);

    sendSuccess(res, categories);
  } catch {
    sendError(res, 500, 'SERVER_ERROR', 'Failed to fetch categories');
  }
}

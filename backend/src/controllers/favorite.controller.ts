import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';

export async function listFavorites(req: AuthRequest, res: Response): Promise<void> {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.userId },
      include: { menuItem: { include: { restaurant: { select: { businessName: true } } } } },
      orderBy: { createdAt: 'desc' },
    });

    sendSuccess(
      res,
      favorites.map((f) => ({
        id: f.menuItem.id,
        name: f.menuItem.name,
        photoUrl: f.menuItem.photoUrl,
        priceRwf: f.menuItem.priceRwf,
        category: f.menuItem.category,
        avgRating: f.menuItem.avgRating,
        restaurantId: f.menuItem.restaurantId,
        restaurantName: f.menuItem.restaurant.businessName,
      }))
    );
  } catch {
    sendError(res, 500, 'SERVER_ERROR', 'Failed to fetch favorites');
  }
}

export async function addFavorite(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { menuItemId } = req.body as { menuItemId?: string };
    if (!menuItemId) {
      sendError(res, 400, 'VALIDATION_ERROR', 'menuItemId is required');
      return;
    }

    const menuItem = await prisma.menuItem.findUnique({ where: { id: menuItemId } });
    if (!menuItem) {
      sendError(res, 404, 'NOT_FOUND', 'Food item not found');
      return;
    }

    await prisma.favorite.upsert({
      where: { userId_menuItemId: { userId: req.userId!, menuItemId } },
      create: { userId: req.userId!, menuItemId },
      update: {},
    });

    sendSuccess(res, { menuItemId, isFavorite: true });
  } catch {
    sendError(res, 500, 'SERVER_ERROR', 'Failed to add favorite');
  }
}

export async function removeFavorite(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { menuItemId } = req.params;

    await prisma.favorite.deleteMany({
      where: { userId: req.userId, menuItemId },
    });

    sendSuccess(res, { menuItemId, isFavorite: false });
  } catch {
    sendError(res, 500, 'SERVER_ERROR', 'Failed to remove favorite');
  }
}

import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';

export async function getMenuItemById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const item = await prisma.menuItem.findFirst({
      where: { id, isAvailable: true, restaurant: { isApproved: true } },
      include: { restaurant: { select: { id: true, businessName: true } } },
    });

    if (!item) {
      sendError(res, 404, 'NOT_FOUND', 'Food item not found');
      return;
    }

    const similar = await prisma.menuItem.findMany({
      where: {
        category: item.category,
        isAvailable: true,
        id: { not: item.id },
        restaurant: { isApproved: true },
      },
      include: { restaurant: { select: { businessName: true } } },
      orderBy: { avgRating: 'desc' },
      take: 6,
    });

    sendSuccess(res, {
      id: item.id,
      name: item.name,
      description: item.description,
      category: item.category,
      priceRwf: item.priceRwf,
      photoUrl: item.photoUrl,
      avgRating: item.avgRating,
      prepTimeMins: item.prepTimeMins,
      ingredients: item.ingredients,
      allergens: item.allergens,
      restaurantId: item.restaurantId,
      restaurantName: item.restaurant.businessName,
      similarItems: similar.map((s) => ({
        id: s.id,
        name: s.name,
        photoUrl: s.photoUrl,
        priceRwf: s.priceRwf,
        category: s.category,
        avgRating: s.avgRating,
        restaurantId: s.restaurantId,
        restaurantName: s.restaurant.businessName,
      })),
    });
  } catch {
    sendError(res, 500, 'SERVER_ERROR', 'Failed to fetch food item');
  }
}

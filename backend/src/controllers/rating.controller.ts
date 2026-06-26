import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';

export async function listFoodRatings(req: Request, res: Response): Promise<void> {
  try {
    const { menuItemId } = req.query as { menuItemId?: string };
    if (!menuItemId) {
      sendError(res, 400, 'VALIDATION_ERROR', 'menuItemId is required');
      return;
    }

    const ratings = await prisma.foodRating.findMany({
      where: { menuItemId },
      include: { customer: { select: { fullName: true, profilePhotoUrl: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const breakdown = [1, 2, 3, 4, 5].map((stars) => ({
      stars,
      count: ratings.filter((r) => r.rating === stars).length,
    }));

    const avgRating =
      ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 0;

    sendSuccess(res, {
      avgRating,
      total: ratings.length,
      breakdown,
      reviews: ratings.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        photoUrl: r.photoUrl,
        createdAt: r.createdAt,
        customerName: r.customer.fullName,
        customerPhotoUrl: r.customer.profilePhotoUrl,
      })),
    });
  } catch {
    sendError(res, 500, 'SERVER_ERROR', 'Failed to fetch ratings');
  }
}

export async function createFoodRating(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { orderId, menuItemId, rating, comment, photoUrl } = req.body as {
      orderId?: string;
      menuItemId?: string;
      rating?: number;
      comment?: string;
      photoUrl?: string;
    };

    if (!orderId || !menuItemId || !rating || rating < 1 || rating > 5) {
      sendError(res, 400, 'VALIDATION_ERROR', 'orderId, menuItemId and a rating from 1-5 are required');
      return;
    }

    const order = await prisma.order.findFirst({
      where: { id: orderId, customerId: req.userId },
      include: { items: true },
    });

    if (!order) {
      sendError(res, 404, 'NOT_FOUND', 'Order not found');
      return;
    }

    if (order.status !== 'DELIVERED') {
      sendError(res, 400, 'ORDER_NOT_DELIVERED', 'You can only rate items from a delivered order');
      return;
    }

    if (!order.items.some((item) => item.menuItemId === menuItemId)) {
      sendError(res, 400, 'ITEM_NOT_IN_ORDER', 'This item was not part of that order');
      return;
    }

    const existing = await prisma.foodRating.findUnique({ where: { orderId } });
    if (existing) {
      sendError(res, 409, 'ALREADY_RATED', 'You already rated this order');
      return;
    }

    const created = await prisma.foodRating.create({
      data: { orderId, menuItemId, customerId: req.userId!, rating, comment, photoUrl },
    });

    const itemRatings = await prisma.foodRating.findMany({ where: { menuItemId } });
    const avgRating = itemRatings.reduce((sum, r) => sum + r.rating, 0) / itemRatings.length;
    await prisma.menuItem.update({ where: { id: menuItemId }, data: { avgRating } });

    sendSuccess(res, created);
  } catch {
    sendError(res, 500, 'SERVER_ERROR', 'Failed to submit rating');
  }
}

export async function listRestaurantRatings(req: Request, res: Response): Promise<void> {
  try {
    const { restaurantId } = req.query as { restaurantId?: string };
    if (!restaurantId) {
      sendError(res, 400, 'VALIDATION_ERROR', 'restaurantId is required');
      return;
    }

    const ratings = await prisma.restaurantRating.findMany({
      where: { restaurantId },
      include: { customer: { select: { fullName: true, profilePhotoUrl: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const breakdown = [1, 2, 3, 4, 5].map((stars) => ({
      stars,
      count: ratings.filter((r) => r.rating === stars).length,
    }));

    const avgRating =
      ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 0;

    sendSuccess(res, {
      avgRating,
      total: ratings.length,
      breakdown,
      reviews: ratings.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        photoUrl: null,
        createdAt: r.createdAt,
        customerName: r.customer.fullName,
        customerPhotoUrl: r.customer.profilePhotoUrl,
      })),
    });
  } catch {
    sendError(res, 500, 'SERVER_ERROR', 'Failed to fetch ratings');
  }
}

export async function createRestaurantRating(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { orderId, restaurantId, rating, comment } = req.body as {
      orderId?: string;
      restaurantId?: string;
      rating?: number;
      comment?: string;
    };

    if (!orderId || !restaurantId || !rating || rating < 1 || rating > 5) {
      sendError(res, 400, 'VALIDATION_ERROR', 'orderId, restaurantId and a rating from 1-5 are required');
      return;
    }

    const order = await prisma.order.findFirst({ where: { id: orderId, customerId: req.userId } });

    if (!order) {
      sendError(res, 404, 'NOT_FOUND', 'Order not found');
      return;
    }

    if (order.status !== 'DELIVERED') {
      sendError(res, 400, 'ORDER_NOT_DELIVERED', 'You can only rate a restaurant from a delivered order');
      return;
    }

    if (order.restaurantId !== restaurantId) {
      sendError(res, 400, 'RESTAURANT_MISMATCH', 'This order was not placed with that restaurant');
      return;
    }

    const existing = await prisma.restaurantRating.findUnique({ where: { orderId } });
    if (existing) {
      sendError(res, 409, 'ALREADY_RATED', 'You already rated this order');
      return;
    }

    const created = await prisma.restaurantRating.create({
      data: { orderId, restaurantId, customerId: req.userId!, rating, comment },
    });

    const restaurantRatings = await prisma.restaurantRating.findMany({ where: { restaurantId } });
    const avgRating =
      restaurantRatings.reduce((sum, r) => sum + r.rating, 0) / restaurantRatings.length;
    await prisma.restaurant.update({ where: { id: restaurantId }, data: { avgRating } });

    sendSuccess(res, created);
  } catch {
    sendError(res, 500, 'SERVER_ERROR', 'Failed to submit rating');
  }
}

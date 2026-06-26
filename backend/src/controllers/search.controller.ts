import { Request, Response } from 'express';
import { FoodCategory } from '@prisma/client';
import prisma from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { haversineDistanceM, estimateEtaMins } from '../utils/geo';

const DEFAULT_LIMIT = 20;

export async function search(req: Request, res: Response): Promise<void> {
  try {
    const { q, type, lat, lng, sort, limit, category, restaurantId } = req.query as {
      q?: string; type?: string; lat?: string; lng?: string;
      sort?: string; limit?: string; category?: FoodCategory; restaurantId?: string;
    };

    const searchType = type ?? 'all';
    const userLat = lat ? parseFloat(lat) : undefined;
    const userLng = lng ? parseFloat(lng) : undefined;
    const take = limit ? Math.max(1, Math.min(parseInt(limit, 10), 50)) : DEFAULT_LIMIT;

    const foods = searchType === 'all' || searchType === 'foods'
      ? await searchFoods(q, sort, take, category, restaurantId)
      : [];

    const restaurants = searchType === 'all' || searchType === 'restaurants'
      ? await searchRestaurants(q, userLat, userLng, take, category)
      : [];

    sendSuccess(res, { foods, restaurants });
  } catch {
    sendError(res, 500, 'SERVER_ERROR', 'Failed to search');
  }
}

async function searchFoods(
  q: string | undefined,
  sort: string | undefined,
  take: number,
  category: FoodCategory | undefined,
  restaurantId: string | undefined
) {
  const items = await prisma.menuItem.findMany({
    where: {
      isAvailable: true,
      restaurant: { isApproved: true },
      ...(q ? { name: { contains: q, mode: 'insensitive' } } : {}),
      ...(category ? { category } : {}),
      ...(restaurantId ? { restaurantId } : {}),
    },
    include: { restaurant: { select: { businessName: true } } },
    orderBy: sort === 'rating' ? { avgRating: 'desc' } : { name: 'asc' },
    take,
  });

  return items.map((item) => ({
    id: item.id,
    name: item.name,
    photoUrl: item.photoUrl,
    priceRwf: item.priceRwf,
    category: item.category,
    avgRating: item.avgRating,
    restaurantId: item.restaurantId,
    restaurantName: item.restaurant.businessName,
  }));
}

async function searchRestaurants(
  q: string | undefined,
  userLat: number | undefined,
  userLng: number | undefined,
  take: number,
  category: FoodCategory | undefined
) {
  const restaurants = await prisma.restaurant.findMany({
    where: {
      isApproved: true,
      ...(q ? { businessName: { contains: q, mode: 'insensitive' } } : {}),
      ...(category ? { menuItems: { some: { category, isAvailable: true } } } : {}),
    },
  });

  const withDistance = restaurants.map((r) => {
    const distanceM =
      userLat !== undefined && userLng !== undefined
        ? Math.round(haversineDistanceM(userLat, userLng, r.lat, r.lng))
        : undefined;
    return {
      id: r.id,
      businessName: r.businessName,
      coverPhotoUrl: r.coverPhotoUrl,
      logoUrl: r.logoUrl,
      isOpen: r.isOpen,
      avgRating: r.avgRating,
      distanceM,
      etaMins: distanceM !== undefined ? estimateEtaMins(distanceM) : undefined,
    };
  });

  withDistance.sort((a, b) =>
    a.distanceM !== undefined && b.distanceM !== undefined
      ? a.distanceM - b.distanceM
      : b.avgRating - a.avgRating
  );

  return withDistance.slice(0, take);
}

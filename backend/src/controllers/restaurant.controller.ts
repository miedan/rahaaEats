import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { haversineDistanceM, estimateEtaMins } from '../utils/geo';
import { FoodCategory } from '@prisma/client';

const DEFAULT_RADIUS_M = 15000;
const DEFAULT_PAGE_SIZE = 20;

export async function listRestaurants(req: Request, res: Response): Promise<void> {
  try {
    const { lat, lng, search, category, page, pageSize, radius } = req.query as {
      lat?: string; lng?: string; search?: string; category?: string;
      page?: string; pageSize?: string; radius?: string;
    };

    const userLat = lat ? parseFloat(lat) : undefined;
    const userLng = lng ? parseFloat(lng) : undefined;
    const radiusM = radius ? parseFloat(radius) : DEFAULT_RADIUS_M;
    const pageNum = page ? Math.max(1, parseInt(page, 10)) : 1;
    const size = pageSize ? Math.max(1, parseInt(pageSize, 10)) : DEFAULT_PAGE_SIZE;

    const restaurants = await prisma.restaurant.findMany({
      where: {
        isApproved: true,
        ...(search ? { businessName: { contains: search, mode: 'insensitive' } } : {}),
        ...(category
          ? { menuItems: { some: { category: category as FoodCategory, isAvailable: true } } }
          : {}),
      },
    });

    let withDistance = restaurants.map((r) => {
      const distanceM =
        userLat !== undefined && userLng !== undefined
          ? Math.round(haversineDistanceM(userLat, userLng, r.lat, r.lng))
          : undefined;
      return {
        id: r.id,
        businessName: r.businessName,
        lat: r.lat,
        lng: r.lng,
        addressDetails: r.addressDetails,
        coverPhotoUrl: r.coverPhotoUrl,
        logoUrl: r.logoUrl,
        isApproved: r.isApproved,
        isOpen: r.isOpen,
        avgRating: r.avgRating,
        distanceM,
        etaMins: distanceM !== undefined ? estimateEtaMins(distanceM) : undefined,
      };
    });

    if (userLat !== undefined && userLng !== undefined) {
      withDistance = withDistance.filter((r) => (r.distanceM ?? 0) <= radiusM);
      withDistance.sort((a, b) => (a.distanceM ?? 0) - (b.distanceM ?? 0));
    } else {
      withDistance.sort((a, b) => b.avgRating - a.avgRating);
    }

    const total = withDistance.length;
    const start = (pageNum - 1) * size;
    const items = withDistance.slice(start, start + size);

    sendSuccess(res, {
      items,
      total,
      page: pageNum,
      pageSize: size,
      hasMore: start + size < total,
    });
  } catch {
    sendError(res, 500, 'SERVER_ERROR', 'Failed to fetch restaurants');
  }
}

export async function getRestaurantById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { lat, lng } = req.query as { lat?: string; lng?: string };

    const restaurant = await prisma.restaurant.findFirst({
      where: { id, isApproved: true },
      include: {
        hours: true,
        menuSections: {
          orderBy: { displayOrder: 'asc' },
          include: {
            items: {
              where: { isAvailable: true },
            },
          },
        },
      },
    });

    if (!restaurant) {
      sendError(res, 404, 'NOT_FOUND', 'Restaurant not found');
      return;
    }

    const userLat = lat ? parseFloat(lat) : undefined;
    const userLng = lng ? parseFloat(lng) : undefined;
    const distanceM =
      userLat !== undefined && userLng !== undefined
        ? Math.round(haversineDistanceM(userLat, userLng, restaurant.lat, restaurant.lng))
        : undefined;

    sendSuccess(res, { ...restaurant, distanceM });
  } catch {
    sendError(res, 500, 'SERVER_ERROR', 'Failed to fetch restaurant');
  }
}

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { FoodCategory, MenuSectionType, OrderStatus, UserRole } from '@prisma/client';

// ─── Stats ───────────────────────────────────────────────────────────────────

export async function getStats(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const [
      totalUsers,
      totalRestaurants,
      pendingApprovals,
      totalOrders,
      revenueAgg,
      totalFoodRatings,
      totalRestaurantRatings,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.restaurant.count(),
      prisma.restaurant.count({ where: { isApproved: false } }),
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { totalRwf: true } }),
      prisma.foodRating.count(),
      prisma.restaurantRating.count(),
    ]);

    sendSuccess(res, {
      totalUsers,
      totalRestaurants,
      pendingApprovals,
      totalOrders,
      totalRevenueRwf: revenueAgg._sum.totalRwf ?? 0,
      totalFoodRatings,
      totalRestaurantRatings,
    });
  } catch {
    sendError(res, 500, 'SERVER_ERROR', 'Failed to fetch stats');
  }
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function listUsers(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { search, role, page, pageSize } = req.query as {
      search?: string;
      role?: string;
      page?: string;
      pageSize?: string;
    };

    const pageNum = page ? Math.max(1, parseInt(page, 10)) : 1;
    const size = pageSize ? Math.max(1, parseInt(pageSize, 10)) : 20;

    const where = {
      ...(role ? { role: role as UserRole } : {}),
      ...(search
        ? {
            OR: [
              { fullName: { contains: search, mode: 'insensitive' as const } },
              { phoneNumber: { contains: search, mode: 'insensitive' as const } },
              { email: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          phoneNumber: true,
          fullName: true,
          email: true,
          profilePhotoUrl: true,
          role: true,
          isVerified: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * size,
        take: size,
      }),
      prisma.user.count({ where }),
    ]);

    sendSuccess(res, { items: users, total, page: pageNum, pageSize: size, hasMore: pageNum * size < total });
  } catch {
    sendError(res, 500, 'SERVER_ERROR', 'Failed to fetch users');
  }
}

export async function deleteUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    if (id === req.userId) {
      sendError(res, 400, 'CANNOT_DELETE_SELF', 'You cannot delete your own account');
      return;
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      sendError(res, 404, 'NOT_FOUND', 'User not found');
      return;
    }

    const [orderCount, restaurantCount] = await Promise.all([
      prisma.order.count({ where: { customerId: id } }),
      prisma.restaurant.count({ where: { ownerUserId: id } }),
    ]);

    if (orderCount > 0) {
      sendError(res, 409, 'HAS_ORDERS', `User has ${orderCount} order(s) and cannot be deleted`);
      return;
    }

    if (restaurantCount > 0) {
      sendError(res, 409, 'HAS_RESTAURANTS', `User owns ${restaurantCount} restaurant(s). Remove them first.`);
      return;
    }

    await prisma.user.delete({ where: { id } });
    sendSuccess(res, { deleted: true });
  } catch {
    sendError(res, 500, 'SERVER_ERROR', 'Failed to delete user');
  }
}

export async function updateUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { role } = req.body as { role?: UserRole };

    if (!role) {
      sendError(res, 400, 'VALIDATION_ERROR', 'role is required');
      return;
    }

    const validRoles: UserRole[] = ['CUSTOMER', 'RIDER', 'RESTAURANT_OWNER', 'ADMIN'];
    if (!validRoles.includes(role)) {
      sendError(res, 400, 'VALIDATION_ERROR', 'Invalid role');
      return;
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, phoneNumber: true, fullName: true, email: true, role: true, isVerified: true, createdAt: true },
    });

    sendSuccess(res, user);
  } catch {
    sendError(res, 500, 'SERVER_ERROR', 'Failed to update user');
  }
}

// ─── Restaurants ──────────────────────────────────────────────────────────────

export async function listRestaurantsAdmin(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { search, approved, page, pageSize } = req.query as {
      search?: string;
      approved?: string;
      page?: string;
      pageSize?: string;
    };

    const pageNum = page ? Math.max(1, parseInt(page, 10)) : 1;
    const size = pageSize ? Math.max(1, parseInt(pageSize, 10)) : 20;

    const where = {
      ...(approved !== undefined ? { isApproved: approved === 'true' } : {}),
      ...(search ? { businessName: { contains: search, mode: 'insensitive' as const } } : {}),
    };

    const [restaurants, total] = await Promise.all([
      prisma.restaurant.findMany({
        where,
        include: {
          owner: { select: { fullName: true, phoneNumber: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * size,
        take: size,
      }),
      prisma.restaurant.count({ where }),
    ]);

    sendSuccess(res, { items: restaurants, total, page: pageNum, pageSize: size, hasMore: pageNum * size < total });
  } catch {
    sendError(res, 500, 'SERVER_ERROR', 'Failed to fetch restaurants');
  }
}

export async function createRestaurant(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { ownerPhone, businessName, rdbNumber, lat, lng, addressDetails, commissionPercent, photoUrl, hours } = req.body as {
      ownerPhone?: string;
      businessName?: string;
      rdbNumber?: string;
      lat?: number;
      lng?: number;
      addressDetails?: string;
      commissionPercent?: number;
      photoUrl?: string;
      hours?: Array<{ dayOfWeek: number; openTime: string; closeTime: string; isClosed: boolean }>;
    };

    if (!ownerPhone || !businessName || lat === undefined || lng === undefined) {
      sendError(res, 400, 'VALIDATION_ERROR', 'ownerPhone, businessName, lat, lng are required');
      return;
    }

    let owner = await prisma.user.findUnique({ where: { phoneNumber: ownerPhone } });
    if (!owner) {
      const bcrypt = await import('bcrypt');
      const tempPassword = Math.random().toString(36).slice(-10);
      owner = await prisma.user.create({
        data: {
          phoneNumber: ownerPhone,
          passwordHash: await bcrypt.hash(tempPassword, 12),
          role: 'RESTAURANT_OWNER',
          isVerified: true,
        },
      });
    } else if (owner.role === 'CUSTOMER') {
      owner = await prisma.user.update({
        where: { id: owner.id },
        data: { role: 'RESTAURANT_OWNER' },
      });
    }

    const restaurant = await prisma.$transaction(async (tx) => {
      const created = await tx.restaurant.create({
        data: {
          ownerUserId: owner!.id,
          businessName,
          rdbNumber: rdbNumber ?? null,
          lat,
          lng,
          addressDetails: addressDetails ?? null,
          commissionPercent: commissionPercent ?? 10,
          logoUrl: photoUrl ?? null,
          coverPhotoUrl: photoUrl ?? null,
        },
      });

      if (hours && hours.length > 0) {
        await tx.restaurantHours.createMany({
          data: hours.map((h) => ({
            restaurantId: created.id,
            dayOfWeek: h.dayOfWeek,
            openTime: h.openTime,
            closeTime: h.closeTime,
            isClosed: h.isClosed,
          })),
        });
      }

      return created;
    });

    sendSuccess(res, restaurant, 201);
  } catch {
    sendError(res, 500, 'SERVER_ERROR', 'Failed to create restaurant');
  }
}

export async function updateRestaurant(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const {
      businessName,
      rdbNumber,
      lat,
      lng,
      addressDetails,
      photoUrl,
      commissionPercent,
      isOpen,
    } = req.body as {
      businessName?: string;
      rdbNumber?: string;
      lat?: number;
      lng?: number;
      addressDetails?: string;
      photoUrl?: string;
      commissionPercent?: number;
      isOpen?: boolean;
    };

    const restaurant = await prisma.restaurant.update({
      where: { id },
      data: {
        ...(businessName !== undefined ? { businessName } : {}),
        ...(rdbNumber !== undefined ? { rdbNumber } : {}),
        ...(lat !== undefined ? { lat } : {}),
        ...(lng !== undefined ? { lng } : {}),
        ...(addressDetails !== undefined ? { addressDetails } : {}),
        ...(photoUrl !== undefined ? { logoUrl: photoUrl, coverPhotoUrl: photoUrl } : {}),
        ...(commissionPercent !== undefined ? { commissionPercent } : {}),
        ...(isOpen !== undefined ? { isOpen } : {}),
      },
    });

    sendSuccess(res, restaurant);
  } catch {
    sendError(res, 500, 'SERVER_ERROR', 'Failed to update restaurant');
  }
}

export async function approveRestaurant(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { approved } = req.body as { approved?: boolean };

    if (approved === undefined) {
      sendError(res, 400, 'VALIDATION_ERROR', 'approved (boolean) is required');
      return;
    }

    const restaurant = await prisma.restaurant.update({
      where: { id },
      data: { isApproved: approved },
    });

    sendSuccess(res, restaurant);
  } catch {
    sendError(res, 500, 'SERVER_ERROR', 'Failed to update restaurant approval');
  }
}

export async function deleteRestaurant(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const restaurant = await prisma.restaurant.findUnique({ where: { id } });
    if (!restaurant) {
      sendError(res, 404, 'NOT_FOUND', 'Restaurant not found');
      return;
    }

    const orderCount = await prisma.order.count({ where: { restaurantId: id } });
    if (orderCount > 0) {
      sendError(res, 409, 'HAS_ORDERS', `Restaurant has ${orderCount} order(s) and cannot be deleted`);
      return;
    }

    await prisma.restaurant.delete({ where: { id } });
    sendSuccess(res, { deleted: true });
  } catch {
    sendError(res, 500, 'SERVER_ERROR', 'Failed to delete restaurant');
  }
}

export async function getRestaurantDetail(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, fullName: true, phoneNumber: true, email: true } },
        hours: { orderBy: { dayOfWeek: 'asc' } },
        menuSections: {
          orderBy: { displayOrder: 'asc' },
          include: {
            items: { orderBy: { createdAt: 'asc' } },
          },
        },
      },
    });

    if (!restaurant) {
      sendError(res, 404, 'NOT_FOUND', 'Restaurant not found');
      return;
    }

    sendSuccess(res, restaurant);
  } catch {
    sendError(res, 500, 'SERVER_ERROR', 'Failed to fetch restaurant');
  }
}

// ─── Menu Sections ────────────────────────────────────────────────────────────

export async function listMenuSections(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const sections = await prisma.menuSection.findMany({
      where: { restaurantId: id },
      orderBy: { displayOrder: 'asc' },
      include: { items: true },
    });

    sendSuccess(res, sections);
  } catch {
    sendError(res, 500, 'SERVER_ERROR', 'Failed to fetch menu sections');
  }
}

export async function createMenuSection(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { name, type, displayOrder } = req.body as { name?: string; type?: MenuSectionType; displayOrder?: number };

    if (!name) {
      sendError(res, 400, 'VALIDATION_ERROR', 'name is required');
      return;
    }

    const validTypes: MenuSectionType[] = ['FOOD', 'DRINK'];
    if (type && !validTypes.includes(type)) {
      sendError(res, 400, 'VALIDATION_ERROR', 'type must be FOOD or DRINK');
      return;
    }

    const restaurant = await prisma.restaurant.findUnique({ where: { id } });
    if (!restaurant) {
      sendError(res, 404, 'NOT_FOUND', 'Restaurant not found');
      return;
    }

    const section = await prisma.menuSection.create({
      data: { restaurantId: id, name, type: type ?? 'FOOD', displayOrder: displayOrder ?? 0 },
    });

    sendSuccess(res, section, 201);
  } catch {
    sendError(res, 500, 'SERVER_ERROR', 'Failed to create menu section');
  }
}

// ─── Menu Items ───────────────────────────────────────────────────────────────

export async function createMenuItem(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { restaurantId } = req.params;
    const {
      sectionId,
      name,
      description,
      category,
      priceRwf,
      photoUrl,
      isAvailable,
      prepTimeMins,
      ingredients,
      allergens,
    } = req.body as {
      sectionId?: string;
      name?: string;
      description?: string;
      category?: FoodCategory;
      priceRwf?: number;
      photoUrl?: string;
      isAvailable?: boolean;
      prepTimeMins?: number;
      ingredients?: string;
      allergens?: string;
    };

    if (!sectionId || !name || priceRwf === undefined) {
      sendError(res, 400, 'VALIDATION_ERROR', 'sectionId, name, priceRwf are required');
      return;
    }

    const section = await prisma.menuSection.findFirst({ where: { id: sectionId, restaurantId } });
    if (!section) {
      sendError(res, 404, 'NOT_FOUND', 'Menu section not found for this restaurant');
      return;
    }

    const item = await prisma.menuItem.create({
      data: {
        sectionId,
        restaurantId,
        name,
        description: description ?? null,
        category: category ?? 'OTHER',
        priceRwf,
        photoUrl: photoUrl ?? null,
        isAvailable: isAvailable ?? true,
        prepTimeMins: prepTimeMins ?? null,
        ingredients: ingredients ?? null,
        allergens: allergens ?? null,
      },
    });

    sendSuccess(res, item, 201);
  } catch {
    sendError(res, 500, 'SERVER_ERROR', 'Failed to create menu item');
  }
}

export async function updateMenuItem(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const {
      sectionId,
      name,
      description,
      category,
      priceRwf,
      photoUrl,
      isAvailable,
      prepTimeMins,
      ingredients,
      allergens,
    } = req.body as {
      sectionId?: string;
      name?: string;
      description?: string;
      category?: FoodCategory;
      priceRwf?: number;
      photoUrl?: string;
      isAvailable?: boolean;
      prepTimeMins?: number;
      ingredients?: string;
      allergens?: string;
    };

    const item = await prisma.menuItem.update({
      where: { id },
      data: {
        ...(sectionId !== undefined ? { sectionId } : {}),
        ...(name !== undefined ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(priceRwf !== undefined ? { priceRwf } : {}),
        ...(photoUrl !== undefined ? { photoUrl } : {}),
        ...(isAvailable !== undefined ? { isAvailable } : {}),
        ...(prepTimeMins !== undefined ? { prepTimeMins } : {}),
        ...(ingredients !== undefined ? { ingredients } : {}),
        ...(allergens !== undefined ? { allergens } : {}),
      },
    });

    sendSuccess(res, item);
  } catch {
    sendError(res, 500, 'SERVER_ERROR', 'Failed to update menu item');
  }
}

export async function deleteMenuItem(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await prisma.menuItem.delete({ where: { id } });
    sendSuccess(res, { deleted: true });
  } catch {
    sendError(res, 500, 'SERVER_ERROR', 'Failed to delete menu item');
  }
}

// ─── Restaurant Hours ─────────────────────────────────────────────────────────

export async function updateRestaurantHours(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const hours = req.body as Array<{
      dayOfWeek: number;
      openTime: string;
      closeTime: string;
      isClosed: boolean;
    }>;

    if (!Array.isArray(hours) || hours.length === 0) {
      sendError(res, 400, 'VALIDATION_ERROR', 'hours must be a non-empty array');
      return;
    }

    const restaurant = await prisma.restaurant.findUnique({ where: { id } });
    if (!restaurant) {
      sendError(res, 404, 'NOT_FOUND', 'Restaurant not found');
      return;
    }

    await prisma.$transaction(async (tx) => {
      await tx.restaurantHours.deleteMany({ where: { restaurantId: id } });
      await tx.restaurantHours.createMany({
        data: hours.map((h) => ({
          restaurantId: id,
          dayOfWeek: h.dayOfWeek,
          openTime: h.openTime,
          closeTime: h.closeTime,
          isClosed: h.isClosed,
        })),
      });
    });

    const updated = await prisma.restaurantHours.findMany({
      where: { restaurantId: id },
      orderBy: { dayOfWeek: 'asc' },
    });

    sendSuccess(res, updated);
  } catch {
    sendError(res, 500, 'SERVER_ERROR', 'Failed to update restaurant hours');
  }
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export async function listOrdersAdmin(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { status, search, page, pageSize } = req.query as {
      status?: string;
      search?: string;
      page?: string;
      pageSize?: string;
    };

    const pageNum = page ? Math.max(1, parseInt(page, 10)) : 1;
    const size = pageSize ? Math.max(1, parseInt(pageSize, 10)) : 20;

    const where = {
      ...(status ? { status: status as OrderStatus } : {}),
      ...(search
        ? {
            customer: {
              OR: [
                { fullName: { contains: search, mode: 'insensitive' as const } },
                { phoneNumber: { contains: search, mode: 'insensitive' as const } },
              ],
            },
          }
        : {}),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: { select: { fullName: true, phoneNumber: true } },
          restaurant: { select: { businessName: true } },
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * size,
        take: size,
      }),
      prisma.order.count({ where }),
    ]);

    sendSuccess(res, { items: orders, total, page: pageNum, pageSize: size, hasMore: pageNum * size < total });
  } catch {
    sendError(res, 500, 'SERVER_ERROR', 'Failed to fetch orders');
  }
}

// ─── Ratings ──────────────────────────────────────────────────────────────────

export async function listAllRatings(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { type, page, pageSize } = req.query as {
      type?: string;
      page?: string;
      pageSize?: string;
    };

    const pageNum = page ? Math.max(1, parseInt(page, 10)) : 1;
    const size = pageSize ? Math.max(1, parseInt(pageSize, 10)) : 20;

    if (!type || type === 'food') {
      const [ratings, total] = await Promise.all([
        prisma.foodRating.findMany({
          include: {
            menuItem: { select: { name: true } },
            customer: { select: { fullName: true, phoneNumber: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip: (pageNum - 1) * size,
          take: size,
        }),
        prisma.foodRating.count(),
      ]);

      if (!type) {
        // also get restaurant ratings for combined view
        const [restaurantRatings, restaurantTotal] = await Promise.all([
          prisma.restaurantRating.findMany({
            include: {
              restaurant: { select: { businessName: true } },
              customer: { select: { fullName: true, phoneNumber: true } },
            },
            orderBy: { createdAt: 'desc' },
            skip: (pageNum - 1) * size,
            take: size,
          }),
          prisma.restaurantRating.count(),
        ]);
        sendSuccess(res, {
          food: { items: ratings, total },
          restaurant: { items: restaurantRatings, total: restaurantTotal },
        });
        return;
      }

      sendSuccess(res, { items: ratings, total, page: pageNum, pageSize: size, hasMore: pageNum * size < total });
      return;
    }

    if (type === 'restaurant') {
      const [ratings, total] = await Promise.all([
        prisma.restaurantRating.findMany({
          include: {
            restaurant: { select: { businessName: true } },
            customer: { select: { fullName: true, phoneNumber: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip: (pageNum - 1) * size,
          take: size,
        }),
        prisma.restaurantRating.count(),
      ]);

      sendSuccess(res, { items: ratings, total, page: pageNum, pageSize: size, hasMore: pageNum * size < total });
      return;
    }

    sendError(res, 400, 'VALIDATION_ERROR', 'type must be "food" or "restaurant"');
  } catch {
    sendError(res, 500, 'SERVER_ERROR', 'Failed to fetch ratings');
  }
}

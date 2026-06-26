import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';

const DELIVERY_FEE_RWF = 1500;

interface OrderItemInput {
  menuItemId: string;
  quantity: number;
}

export async function createOrder(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { restaurantId, items, deliveryAddressId, paymentMethod, promoCode } = req.body as {
      restaurantId?: string;
      items?: OrderItemInput[];
      deliveryAddressId?: string;
      paymentMethod?: 'MOMO_MTN' | 'MOMO_AIRTEL' | 'CASH';
      promoCode?: string;
    };

    if (!restaurantId || !items?.length || !deliveryAddressId || !paymentMethod) {
      sendError(
        res,
        400,
        'VALIDATION_ERROR',
        'restaurantId, items, deliveryAddressId and paymentMethod are required'
      );
      return;
    }

    const address = await prisma.address.findFirst({
      where: { id: deliveryAddressId, userId: req.userId },
    });
    if (!address) {
      sendError(res, 404, 'NOT_FOUND', 'Delivery address not found');
      return;
    }

    const restaurant = await prisma.restaurant.findFirst({
      where: { id: restaurantId, isApproved: true },
    });
    if (!restaurant) {
      sendError(res, 404, 'NOT_FOUND', 'Restaurant not found');
      return;
    }

    const menuItemIds = items.map((i) => i.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds }, restaurantId, isAvailable: true },
    });

    if (menuItems.length !== menuItemIds.length) {
      sendError(res, 400, 'INVALID_ITEMS', 'One or more items are unavailable or do not belong to this restaurant');
      return;
    }

    const subtotalRwf = items.reduce((sum, item) => {
      const menuItem = menuItems.find((m) => m.id === item.menuItemId)!;
      return sum + menuItem.priceRwf * item.quantity;
    }, 0);

    let discountRwf = 0;
    let appliedPromo: { id: string } | null = null;

    if (promoCode) {
      const promo = await prisma.promoCode.findUnique({ where: { code: promoCode.toUpperCase() } });
      const isUsable =
        promo &&
        (!promo.expiresAt || promo.expiresAt > new Date()) &&
        (promo.maxUses === null || promo.usedCount < promo.maxUses) &&
        subtotalRwf >= promo.minOrderRwf;

      if (!isUsable) {
        sendError(res, 400, 'INVALID_PROMO', 'This coupon is not valid for this order');
        return;
      }

      discountRwf =
        promo.discountType === 'PERCENT'
          ? Math.round((subtotalRwf * promo.discountValue) / 100)
          : promo.discountValue;
      discountRwf = Math.min(discountRwf, subtotalRwf);
      appliedPromo = promo;
    }

    const totalRwf = subtotalRwf + DELIVERY_FEE_RWF - discountRwf;

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          customerId: req.userId!,
          restaurantId,
          status: 'PLACED',
          subtotalRwf,
          deliveryFeeRwf: DELIVERY_FEE_RWF,
          discountRwf,
          totalRwf,
          paymentMethod,
          // Paypack cashin integration is pending real merchant credentials;
          // paymentStatus stays PENDING until that's wired up.
          paymentStatus: 'PENDING',
          deliveryAddressId,
          items: {
            create: items.map((item) => {
              const menuItem = menuItems.find((m) => m.id === item.menuItemId)!;
              return {
                menuItemId: item.menuItemId,
                quantity: item.quantity,
                unitPriceRwf: menuItem.priceRwf,
              };
            }),
          },
        },
        include: { items: true },
      });

      if (appliedPromo) {
        await tx.promoCode.update({
          where: { id: appliedPromo.id },
          data: { usedCount: { increment: 1 } },
        });
      }

      return created;
    });

    sendSuccess(res, order, 201);
  } catch {
    sendError(res, 500, 'SERVER_ERROR', 'Failed to create order');
  }
}

export async function listOrders(req: AuthRequest, res: Response): Promise<void> {
  try {
    const orders = await prisma.order.findMany({
      where: { customerId: req.userId },
      include: {
        items: { include: { menuItem: { select: { name: true, photoUrl: true } } } },
        restaurant: { select: { businessName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    sendSuccess(res, orders);
  } catch {
    sendError(res, 500, 'SERVER_ERROR', 'Failed to fetch orders');
  }
}

export async function getOrderById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const order = await prisma.order.findFirst({
      where: { id, customerId: req.userId },
      include: {
        items: { include: { menuItem: { select: { name: true, photoUrl: true } } } },
        restaurant: { select: { businessName: true } },
        deliveryAddress: true,
      },
    });

    if (!order) {
      sendError(res, 404, 'NOT_FOUND', 'Order not found');
      return;
    }

    sendSuccess(res, order);
  } catch {
    sendError(res, 500, 'SERVER_ERROR', 'Failed to fetch order');
  }
}

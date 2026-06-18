import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';

export async function getAddresses(req: AuthRequest, res: Response): Promise<void> {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });
    sendSuccess(res, addresses);
  } catch {
    sendError(res, 500, 'SERVER_ERROR', 'Failed to fetch addresses');
  }
}

export async function createAddress(req: AuthRequest, res: Response): Promise<void> {
  try {
    const {
      label, lat, lng, formattedAddress, buildingType,
      houseNumber, apartmentName, buildingNumber, floorNumber, doorNumber,
      district, districtPin, deliveryInstructions, contactName, contactPhone, isDefault,
    } = req.body as {
      label: string; lat: number; lng: number; formattedAddress?: string;
      buildingType?: string; houseNumber?: string; apartmentName?: string;
      buildingNumber?: string; floorNumber?: string; doorNumber?: string;
      district: string; districtPin?: string; deliveryInstructions?: string;
      contactName?: string; contactPhone?: string; isDefault?: boolean;
    };

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.userId },
        data: { isDefault: false },
      });
    }

    const hasExisting = await prisma.address.count({ where: { userId: req.userId } });

    const address = await prisma.address.create({
      data: {
        userId: req.userId!,
        label, lat, lng,
        formattedAddress: formattedAddress ?? null,
        buildingType: buildingType ?? null,
        houseNumber: houseNumber ?? null,
        apartmentName: apartmentName ?? null,
        buildingNumber: buildingNumber ?? null,
        floorNumber: floorNumber ?? null,
        doorNumber: doorNumber ?? null,
        district,
        districtPin: districtPin ?? null,
        deliveryInstructions: deliveryInstructions ?? null,
        contactName: contactName ?? null,
        contactPhone: contactPhone ?? null,
        isDefault: isDefault ?? hasExisting === 0,
      },
    });

    sendSuccess(res, address, 201);
  } catch {
    sendError(res, 500, 'SERVER_ERROR', 'Failed to create address');
  }
}

export async function updateAddress(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const existing = await prisma.address.findFirst({ where: { id, userId: req.userId } });
    if (!existing) {
      sendError(res, 404, 'NOT_FOUND', 'Address not found');
      return;
    }

    const address = await prisma.address.update({
      where: { id },
      data: req.body,
    });
    sendSuccess(res, address);
  } catch {
    sendError(res, 500, 'SERVER_ERROR', 'Failed to update address');
  }
}

export async function deleteAddress(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const existing = await prisma.address.findFirst({ where: { id, userId: req.userId } });
    if (!existing) {
      sendError(res, 404, 'NOT_FOUND', 'Address not found');
      return;
    }

    await prisma.address.delete({ where: { id } });
    sendSuccess(res, { message: 'Address deleted' });
  } catch {
    sendError(res, 500, 'SERVER_ERROR', 'Failed to delete address');
  }
}

export async function setDefaultAddress(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const existing = await prisma.address.findFirst({ where: { id, userId: req.userId } });
    if (!existing) {
      sendError(res, 404, 'NOT_FOUND', 'Address not found');
      return;
    }

    await prisma.address.updateMany({
      where: { userId: req.userId },
      data: { isDefault: false },
    });
    const address = await prisma.address.update({
      where: { id },
      data: { isDefault: true },
    });
    sendSuccess(res, address);
  } catch {
    sendError(res, 500, 'SERVER_ERROR', 'Failed to set default address');
  }
}

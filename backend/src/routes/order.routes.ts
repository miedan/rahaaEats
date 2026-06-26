import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createOrder, listOrders, getOrderById } from '../controllers/order.controller';

const router = Router();

router.use(authenticate);

router.get('/', listOrders);

router.post(
  '/',
  [
    body('restaurantId').isString().notEmpty().withMessage('restaurantId is required'),
    body('items').isArray({ min: 1 }).withMessage('items must be a non-empty array'),
    body('items.*.menuItemId').isString().notEmpty().withMessage('menuItemId is required'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('quantity must be at least 1'),
    body('deliveryAddressId').isString().notEmpty().withMessage('deliveryAddressId is required'),
    body('paymentMethod').isIn(['MOMO_MTN', 'MOMO_AIRTEL', 'CASH']).withMessage('Invalid paymentMethod'),
    body('promoCode').optional().isString(),
    validate,
  ],
  createOrder
);

router.get('/:id', [param('id').notEmpty(), validate], getOrderById);

export default router;

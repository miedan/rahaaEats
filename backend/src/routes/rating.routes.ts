import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  listFoodRatings,
  createFoodRating,
  listRestaurantRatings,
  createRestaurantRating,
} from '../controllers/rating.controller';

const router = Router();

// GET /api/v1/ratings/food?menuItemId=...
router.get('/food', listFoodRatings);

// POST /api/v1/ratings/food
router.post(
  '/food',
  authenticate,
  [
    body('orderId').isString().notEmpty().withMessage('orderId is required'),
    body('menuItemId').isString().notEmpty().withMessage('menuItemId is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('rating must be between 1 and 5'),
    body('comment').optional().isString(),
    body('photoUrl').optional().isURL().withMessage('Invalid photo URL'),
    validate,
  ],
  createFoodRating
);

// GET /api/v1/ratings/restaurant?restaurantId=...
router.get('/restaurant', listRestaurantRatings);

// POST /api/v1/ratings/restaurant
router.post(
  '/restaurant',
  authenticate,
  [
    body('orderId').isString().notEmpty().withMessage('orderId is required'),
    body('restaurantId').isString().notEmpty().withMessage('restaurantId is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('rating must be between 1 and 5'),
    body('comment').optional().isString(),
    validate,
  ],
  createRestaurantRating
);

export default router;

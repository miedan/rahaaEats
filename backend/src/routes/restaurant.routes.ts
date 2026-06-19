import { Router } from 'express';
import { query, param } from 'express-validator';
import { validate } from '../middleware/validate.middleware';
import { listRestaurants, getRestaurantById } from '../controllers/restaurant.controller';

const router = Router();

router.get(
  '/',
  [
    query('lat').optional().isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
    query('lng').optional().isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
    query('category')
      .optional()
      .isIn(['BURGER', 'BEEF', 'DESSERT', 'JUICE', 'NOODLES', 'PIZZA', 'SALAD', 'OTHER'])
      .withMessage('Invalid category'),
    query('page').optional().isInt({ min: 1 }).withMessage('Invalid page'),
    query('pageSize').optional().isInt({ min: 1, max: 100 }).withMessage('Invalid pageSize'),
    validate,
  ],
  listRestaurants
);

router.get(
  '/:id',
  [param('id').notEmpty().withMessage('Invalid restaurant id'), validate],
  getRestaurantById
);

export default router;
